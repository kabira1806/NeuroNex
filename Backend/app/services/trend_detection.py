from datetime import datetime, timedelta
import numpy as np
from sklearn.linear_model import LinearRegression
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.models import HealthVital, Alert


# -------------------------------------------------
# Helper: ML-based trend detection (generic)
# -------------------------------------------------

def detect_trend_lr(values):
    values = np.asarray(values, dtype=float)

    if values.size < 3:
        return "insufficient_data"

    X = np.arange(values.size).reshape(-1, 1)
    y = values

    model = LinearRegression()
    model.fit(X, y)

    slope = model.coef_[0]
    r2 = model.score(X, y)

    trend_score = np.tanh(slope) * r2

    labels = np.array(["falling", "stable", "rising"])
    centers = np.array([-1.0, 0.0, 1.0])

    return labels[np.argmin(np.abs(trend_score - centers))]


# -------------------------------------------------
# BP Trend (systolic + diastolic independently)
# -------------------------------------------------

async def get_bp_trend(db: AsyncSession, elder_id: int, days: int):
    since = datetime.utcnow() - timedelta(days=days)

    stmt = (
        select(HealthVital)
        .where(
            HealthVital.elder_id == elder_id,
            HealthVital.vital_type.in_(["bp_systolic", "bp_diastolic"]),
            HealthVital.recorded_at >= since,
        )
        .order_by(HealthVital.recorded_at)
    )

    result = await db.execute(stmt)
    vitals = result.scalars().all()

    systolic = [v.value for v in vitals if v.vital_type == "bp_systolic"]
    diastolic = [v.value for v in vitals if v.vital_type == "bp_diastolic"]

    return {
        "systolic_trend": detect_trend_lr(systolic),
        "diastolic_trend": detect_trend_lr(diastolic),
        "recent_values": {
            "systolic": systolic[-5:],
            "diastolic": diastolic[-5:],
        },
    }


# -------------------------------------------------
# Sugar Trend
# -------------------------------------------------

async def get_sugar_trend(db: AsyncSession, elder_id: int, days: int):
    since = datetime.utcnow() - timedelta(days=days)

    stmt = (
        select(HealthVital)
        .where(
            HealthVital.elder_id == elder_id,
            HealthVital.vital_type == "sugar",
            HealthVital.recorded_at >= since,
        )
        .order_by(HealthVital.recorded_at)
    )

    result = await db.execute(stmt)
    vitals = result.scalars().all()

    values = [v.value for v in vitals]

    return {
        "trend": detect_trend_lr(values),
        "recent_values": values[-5:],
    }


# -------------------------------------------------
# ML-based Sugar Alert (NO rule-based if–else)
# -------------------------------------------------

async def evaluate_sugar_and_alert_lr(
    db: AsyncSession,
    elder_id: int,
    value: float,
):
    stmt = (
        select(HealthVital)
        .where(
            HealthVital.elder_id == elder_id,
            HealthVital.vital_type == "sugar",
        )
        .order_by(desc(HealthVital.recorded_at))
        .limit(5)
    )

    result = await db.execute(stmt)
    history = list(reversed(result.scalars().all()))

    values = np.array([v.value for v in history] + [value], dtype=float)

    if values.size < 3:
        return None

    X = np.arange(values.size).reshape(-1, 1)
    y = values

    model = LinearRegression()
    model.fit(X, y)

    slope = model.coef_[0]
    r2 = model.score(X, y)

    risk_score = np.tanh(slope) * r2

    labels = np.array(["normal", "high", "emergency"])
    centers = np.array([0.0, 0.6, 1.0])

    idx = np.argmin(np.abs(risk_score - centers))
    severity = labels[idx]

    alert_map = {
        "normal": None,
        "high": Alert(
            elder_id=elder_id,
            severity="high",
            alert_type="sugar",
            title="Elevated Blood Sugar Trend",
            message=f"Sugar trend risk={risk_score:.2f}, latest={value}",
        ),
        "emergency": Alert(
            elder_id=elder_id,
            severity="emergency",
            alert_type="sugar",
            title="Critical Blood Sugar Trend",
            message=f"Sugar trend risk={risk_score:.2f}, latest={value}",
        ),
    }

    alert = alert_map[severity]

    if alert is not None:
        db.add(alert)
        await db.flush()

    return alert
