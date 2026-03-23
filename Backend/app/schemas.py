"""Pydantic schemas for API request/response."""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


# ----- User -----
class UserBase(BaseModel):
    name: str
    phone: str
    role: str = "elder"
    language: str = "hi"


class UserCreate(UserBase):
    password: str
    caregiver_id: Optional[int] = None


class UserResponse(BaseModel):
    id: int
    name: str
    phone: str
    role: str
    language: str
    created_at: datetime

    class Config:
        from_attributes = True


# ----- Caregiver link -----
class CaregiverLinkCreate(BaseModel):
    elder_id: int
    caregiver_id: int


# ----- Daily check-in -----
class CheckInCreate(BaseModel):
    elder_id: int
    mood: Optional[str] = None
    mood_confidence: Optional[float] = None
    medication_taken: bool = False
    medication_notes: Optional[str] = None
    voice_log_url: Optional[str] = None
    transcript_hi: Optional[str] = None


class CheckInResponse(BaseModel):
    id: int
    elder_id: int
    mood: Optional[str]
    medication_taken: bool
    transcript_hi: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ----- Health vitals -----
class VitalCreate(BaseModel):
    elder_id: int
    vital_type: str  # bp_systolic, bp_diastolic, sugar_fasting, sugar_post
    value: float
    unit: str = ""
    source: str = "manual"


class VitalResponse(BaseModel):
    id: int
    elder_id: int
    vital_type: str
    value: float
    unit: str
    recorded_at: datetime
    source: str

    class Config:
        from_attributes = True


# ----- Medication -----
class MedicationCreate(BaseModel):
    elder_id: int
    name: str
    dosage: Optional[str] = None
    time_slot: Optional[str] = None
    scheduled_date: datetime


class MedicationTakenUpdate(BaseModel):
    taken_at: Optional[datetime] = None  # when marked taken


# ----- Alerts -----
class AlertResponse(BaseModel):
    id: int
    elder_id: int
    severity: str
    alert_type: str
    title: str
    message: Optional[str]
    read_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


# ----- Dashboard aggregates -----
class MoodTrendItem(BaseModel):
    date: str
    mood: Optional[str]
    count: int


class VitalTrendItem(BaseModel):
    date: str
    vital_type: str
    avg_value: float
    min_value: float
    max_value: float
    count: int


class DashboardSummary(BaseModel):
    elder_id: int
    elder_name: str
    last_checkin: Optional[CheckInResponse]
    recent_vitals: List[VitalResponse]
    unread_alerts_count: int
    medication_adherence_today: Optional[float]  # 0-100%
    mood_trend: Optional[List[MoodTrendItem]]
    vital_trends: Optional[List[VitalTrendItem]]
class UserLogin(BaseModel):
    phone: str
    password: str