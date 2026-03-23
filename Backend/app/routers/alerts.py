"""Alerts API for caretaker dashboard (missed meds, abnormal vitals, emergency)."""
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, and_

from app.database import get_db
from app.models import Alert, CaregiverLink
from app.schemas import AlertResponse

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("/elder/{elder_id}", response_model=list[AlertResponse])
async def get_elder_alerts(
    elder_id: int,
    unread_only: bool = False,
    limit: int = Query(50, le=200),
    db: AsyncSession = Depends(get_db),
):
    """Caretaker: list alerts for an elder (optionally unread only)."""
    q = select(Alert).where(Alert.elder_id == elder_id)
    if unread_only:
        q = q.where(Alert.read_at.is_(None))
    q = q.order_by(desc(Alert.created_at)).limit(limit)
    result = await db.execute(q)
    return result.scalars().all()


@router.get("/caregiver/{caregiver_id}", response_model=list[AlertResponse])
async def get_caregiver_alerts(
    caregiver_id: int,
    unread_only: bool = True,
    limit: int = Query(50, le=200),
    db: AsyncSession = Depends(get_db),
):
    """All alerts for elders linked to this caregiver (dashboard feed)."""
    subq = select(CaregiverLink.elder_id).where(CaregiverLink.caregiver_id == caregiver_id)
    result = await db.execute(subq)
    elder_ids = [r[0] for r in result.all()]
    if not elder_ids:
        return []
    q = select(Alert).where(Alert.elder_id.in_(elder_ids))
    if unread_only:
        q = q.where(Alert.read_at.is_(None))
    q = q.order_by(desc(Alert.created_at)).limit(limit)
    result = await db.execute(q)
    return result.scalars().all()


@router.patch("/{alert_id}/read")
async def mark_alert_read(alert_id: int, db: AsyncSession = Depends(get_db)):
    """Mark alert as read by caregiver."""
    from datetime import datetime
    result = await db.execute(select(Alert).where(Alert.id == alert_id))
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(404, "Alert not found")
    alert.read_at = datetime.utcnow()
    await db.commit()
    return {"status": "read", "alert_id": alert_id}


@router.get("/elder/{elder_id}/unread-count")
async def unread_count(elder_id: int, db: AsyncSession = Depends(get_db)):
    """Count of unread alerts for dashboard badge."""
    from sqlalchemy import func
    result = await db.execute(
        select(func.count(Alert.id)).where(
            Alert.elder_id == elder_id,
            Alert.read_at.is_(None)
        )
    )
    count = result.scalar()
    return {"elder_id": elder_id, "unread_count": count if count is not None else 0}
