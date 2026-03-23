"""
Health vitals API.
(Current version: core vitals only — trend detection disabled temporarily)
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.database import get_db
from app.models import HealthVital
from app.schemas import VitalCreate, VitalResponse

router = APIRouter(prefix="/vitals", tags=["vitals"])


@router.post("/", response_model=VitalResponse)
async def record_vital(
    data: VitalCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Record a single vital (BP component or sugar).
    Trend detection & alerts are disabled for now.
    """
    vital = HealthVital(
        elder_id=data.elder_id,
        vital_type=data.vital_type,
        value=data.value,
        unit=data.unit or ("mmHg" if "bp" in data.vital_type else "mg/dL"),
        source=data.source,
    )

    db.add(vital)
    await db.flush()
    await db.commit()
    await db.refresh(vital)

    return vital


@router.post("/bp", response_model=dict)
async def record_bp(
    elder_id: int,
    systolic: float,
    diastolic: float,
    source: str = "manual",
    db: AsyncSession = Depends(get_db),
):
    """
    Record BP (systolic + diastolic).
    Alert logic disabled temporarily.
    """
    s = HealthVital(
        elder_id=elder_id,
        vital_type="bp_systolic",
        value=systolic,
        unit="mmHg",
        source=source,
    )
    d = HealthVital(
        elder_id=elder_id,
        vital_type="bp_diastolic",
        value=diastolic,
        unit="mmHg",
        source=source,
    )

    db.add(s)
    db.add(d)
    await db.flush()
    await db.commit()
    await db.refresh(s)
    await db.refresh(d)

    return {
        "systolic": s,
        "diastolic": d,
        "alert_created": False,
        "alert_title": None,
    }


@router.get("/elder/{elder_id}", response_model=list[VitalResponse])
async def get_elder_vitals(
    elder_id: int,
    vital_type: str | None = None,
    limit: int = Query(50, le=200),
    db: AsyncSession = Depends(get_db),
):
    """
    Caretaker: list vitals for an elder.
    Optional filter by vital_type.
    """
    q = select(HealthVital).where(HealthVital.elder_id == elder_id)

    if vital_type:
        q = q.where(HealthVital.vital_type == vital_type)

    q = q.order_by(desc(HealthVital.recorded_at)).limit(limit)
    result = await db.execute(q)

    return result.scalars().all()
