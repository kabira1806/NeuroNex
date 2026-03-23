"""Caretaker dashboard aggregate API (peace-of-mind UX)."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from datetime import datetime, timedelta

from app.database import get_db
from app.models import User, CaregiverLink, DailyCheckIn, HealthVital, Alert, MedicationRecord

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/caregiver/{caregiver_id}/elders")
async def get_linked_elders(caregiver_id: int, db: AsyncSession = Depends(get_db)):
    """List elders linked to this caregiver (for dashboard cards)."""
    result = await db.execute(
        select(CaregiverLink.elder_id).where(CaregiverLink.caregiver_id == caregiver_id)
    )
    elder_ids = [r[0] for r in result.all()]
    if not elder_ids:
        return {"elders": []}
    result = await db.execute(select(User).where(User.id.in_(elder_ids)))
    elders = result.scalars().all()
    return {"elders": [{"id": u.id, "name": u.name, "phone": u.phone} for u in elders]}


@router.get("/elder/{elder_id}/summary")
async def elder_summary(
    elder_id: int,
    days: int = Query(7, ge=1, le=90),
    db: AsyncSession = Depends(get_db),
):
    """One-screen summary for caretaker: last check-in, recent vitals, unread alerts, adherence."""
    # Elder info
    r = await db.execute(select(User).where(User.id == elder_id))
    elder = r.scalar_one_or_none()
    if not elder:
        return {"error": "Elder not found"}

    # Last check-in
    r = await db.execute(
        select(DailyCheckIn)
        .where(DailyCheckIn.elder_id == elder_id)
        .order_by(desc(DailyCheckIn.created_at))
        .limit(1)
    )
    last_checkin = r.scalar_one_or_none()

    # Recent vitals (last N days)
    since = datetime.utcnow() - timedelta(days=days)
    r = await db.execute(
        select(HealthVital)
        .where(HealthVital.elder_id == elder_id, HealthVital.recorded_at >= since)
        .order_by(desc(HealthVital.recorded_at))
        .limit(20)
    )
    recent_vitals = r.scalars().all()

    # Unread alerts count
    r = await db.execute(
        select(func.count(Alert.id)).where(Alert.elder_id == elder_id, Alert.read_at.is_(None))
    )
    unread_alerts = r.scalar() or 0

    # Medication adherence today (share of today's meds marked taken)
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)
    r = await db.execute(
        select(MedicationRecord)
        .where(
            MedicationRecord.elder_id == elder_id,
            MedicationRecord.scheduled_date >= today_start,
            MedicationRecord.scheduled_date < today_end,
        )
    )
    today_meds = r.scalars().all()
    taken = sum(1 for m in today_meds if m.taken_at is not None)
    adherence = (taken / len(today_meds) * 100) if today_meds else None

    return {
        "elder_id": elder_id,
        "elder_name": elder.name,
        "last_checkin": {
            "id": last_checkin.id,
            "mood": last_checkin.mood,
            "medication_taken": last_checkin.medication_taken,
            "transcript_hi": last_checkin.transcript_hi,
            "created_at": last_checkin.created_at.isoformat() if last_checkin else None,
        } if last_checkin else None,
        "recent_vitals": [
            {"vital_type": v.vital_type, "value": v.value, "unit": v.unit, "recorded_at": v.recorded_at.isoformat()}
            for v in recent_vitals
        ],
        "unread_alerts_count": unread_alerts,
        "medication_adherence_today_pct": round(adherence, 1) if adherence is not None else None,
    }
