"""Daily check-in API (mood, medication status, voice transcript)."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.database import get_db
from app.models import DailyCheckIn, User
from app.schemas import CheckInCreate, CheckInResponse

router = APIRouter(prefix="/checkins", tags=["checkins"])


@router.post("/", response_model=CheckInResponse)
async def create_checkin(data: CheckInCreate, db: AsyncSession = Depends(get_db)):
    """Elder submits daily check-in (voice/text: mood, medication)."""
    checkin = DailyCheckIn(
        elder_id=data.elder_id,
        mood=data.mood,
        mood_confidence=data.mood_confidence,
        medication_taken=data.medication_taken,
        medication_notes=data.medication_notes,
        voice_log_url=data.voice_log_url,
        transcript_hi=data.transcript_hi,
    )
    db.add(checkin)
    await db.flush()
    await db.commit()
    await db.refresh(checkin)
    return checkin


@router.get("/elder/{elder_id}", response_model=list[CheckInResponse])
async def get_elder_checkins(
    elder_id: int,
    limit: int = Query(30, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Caretaker: list check-ins for an elder (for dashboard/history)."""
    result = await db.execute(
        select(DailyCheckIn)
        .where(DailyCheckIn.elder_id == elder_id)
        .order_by(desc(DailyCheckIn.created_at))
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/elder/{elder_id}/latest", response_model=CheckInResponse | None)
async def get_latest_checkin(elder_id: int, db: AsyncSession = Depends(get_db)):
    """Latest check-in for dashboard summary."""
    result = await db.execute(
        select(DailyCheckIn)
        .where(DailyCheckIn.elder_id == elder_id)
        .order_by(desc(DailyCheckIn.created_at))
        .limit(1)
    )
    return result.scalar_one_or_none()
