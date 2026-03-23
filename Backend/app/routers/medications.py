"""Medication records and adherence (for dashboard + missed-med alerts)."""
from datetime import datetime
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.database import get_db
from app.models import MedicationRecord, Alert
from app.schemas import MedicationCreate, MedicationTakenUpdate

router = APIRouter(prefix="/medications", tags=["medications"])


@router.post("/")
async def add_medication(data: MedicationCreate, db: AsyncSession = Depends(get_db)):
    """Add a medication schedule for an elder."""
    rec = MedicationRecord(
        elder_id=data.elder_id,
        name=data.name,
        dosage=data.dosage,
        time_slot=data.time_slot,
        scheduled_date=data.scheduled_date,
    )
    db.add(rec)
    await db.commit()
    await db.refresh(rec)
    return {"id": rec.id, "elder_id": rec.elder_id, "name": rec.name, "scheduled_date": rec.scheduled_date.isoformat()}


@router.patch("/{record_id}/taken")
async def mark_taken(
    record_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Elder marks medication as taken (voice or button)."""
    result = await db.execute(select(MedicationRecord).where(MedicationRecord.id == record_id))
    rec = result.scalar_one_or_none()
    if not rec:
        raise HTTPException(404, "Medication record not found")
    rec.taken_at = datetime.utcnow()
    await db.commit()
    return {"status": "taken", "record_id": record_id}


@router.get("/elder/{elder_id}")
async def get_elder_medications(
    elder_id: int,
    from_date: datetime | None = None,
    to_date: datetime | None = None,
    limit: int = Query(50, le=200),
    db: AsyncSession = Depends(get_db),
):
    """Caretaker / medical records: list medications for an elder."""
    q = select(MedicationRecord).where(MedicationRecord.elder_id == elder_id)
    if from_date:
        q = q.where(MedicationRecord.scheduled_date >= from_date)
    if to_date:
        q = q.where(MedicationRecord.scheduled_date <= to_date)
    q = q.order_by(desc(MedicationRecord.scheduled_date)).limit(limit)
    result = await db.execute(q)
    rows = result.scalars().all()
    return [
        {
            "id": r.id,
            "name": r.name,
            "dosage": r.dosage,
            "time_slot": r.time_slot,
            "scheduled_date": r.scheduled_date.isoformat(),
            "taken_at": r.taken_at.isoformat() if r.taken_at else None,
        }
        for r in rows
    ]
