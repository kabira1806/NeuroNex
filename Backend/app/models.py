from datetime import datetime
import enum

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    Enum as SQLEnum,
    func,
)
from sqlalchemy.orm import relationship
from app.database import Base

# --------------------
# Enums
# --------------------

class UserRole(str, enum.Enum):
    elder = "elder"
    caregiver = "caregiver"

class AlertSeverity(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    emergency = "emergency"

# --------------------
# Tables
# --------------------

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    role = Column(SQLEnum(
        UserRole,
        name="userrole",
        create_type=False 
    ), default=UserRole.elder.value)

    name = Column(String(100), nullable=False)
    phone = Column(String(15), unique=True, index=True)
    
    # 👇 NEW: Password store karne ke liye
    password_hash = Column(String, nullable=False)
    
    language = Column(String(10), default="hi")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    checkins = relationship("DailyCheckIn", back_populates="elder", cascade="all, delete")
    vitals = relationship("HealthVital", back_populates="elder", cascade="all, delete")
    medications = relationship("MedicationRecord", back_populates="elder", cascade="all, delete")
    alerts = relationship("Alert", back_populates="elder", cascade="all, delete")

class CaregiverLink(Base):
    __tablename__ = "caregiver_links"

    id = Column(Integer, primary_key=True, index=True)
    elder_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    caregiver_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class DailyCheckIn(Base):
    __tablename__ = "daily_checkins"

    id = Column(Integer, primary_key=True, index=True)
    elder_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    mood = Column(String(20))
    mood_confidence = Column(Float)
    medication_taken = Column(Boolean, default=False)
    medication_notes = Column(Text)
    voice_log_url = Column(String(500))
    transcript_hi = Column(Text)
    ai_reply = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    elder = relationship("User", back_populates="checkins")

class HealthVital(Base):
    __tablename__ = "health_vitals"

    id = Column(Integer, primary_key=True, index=True)
    elder_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    vital_type = Column(String(50), nullable=False)
    value = Column(Float, nullable=False)
    unit = Column(String(20))
    source = Column(String(50))
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())

    elder = relationship("User", back_populates="vitals")

class MedicationRecord(Base):
    __tablename__ = "medication_records"

    id = Column(Integer, primary_key=True, index=True)
    elder_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    name = Column(String(100), nullable=False)
    dosage = Column(String(50))
    time_slot = Column(String(20))
    taken_at = Column(DateTime(timezone=True))
    scheduled_date = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    elder = relationship("User", back_populates="medications")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    elder_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    severity = Column(SQLEnum(AlertSeverity), default=AlertSeverity.medium)
    alert_type = Column(String(50), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text)
    read_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    elder = relationship("User", back_populates="alerts")

class VoiceAnalysis(Base):
    __tablename__ = "voice_analysis"

    id = Column(Integer, primary_key=True, index=True)
    transcript = Column(Text, nullable=False)
    analysis = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())