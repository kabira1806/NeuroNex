import asyncio
import random
import sys
from pathlib import Path
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
import bcrypt


sys.path.insert(0, str(Path(__file__).parent.parent))

# Import your app modules
from app.config import settings
from app.models import Base, User, HealthVital, UserRole, CaregiverLink

# --- Setup Database Connection ---
engine = create_async_engine(settings.database_url, echo=True)
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

async def seed_data():
    async with AsyncSessionLocal() as db:
        print("\n🌱 Seeding Test Data with Elder & Caregiver...")

        # 1. Create/Get Elder Account
        elder_phone = "9999999999"
        result = await db.execute(select(User).where(User.phone == elder_phone))
        elder = result.scalars().first()

        if not elder:
            hashed_password = hash_password("test123")  # Hash the password
            elder = User(
                name="Grandpa Joe (Test)", 
                phone=elder_phone, 
                role=UserRole.elder,
                password_hash=hashed_password,  # Include hashed password
                language="hi"
            )
            db.add(elder)
            await db.commit()
            await db.refresh(elder)
            print(f"👴 Created Elder: {elder.name} (ID: {elder.id})")
        else:
            print(f"👴 Using existing Elder: {elder.name} (ID: {elder.id})")

        # 2. Create/Get Caregiver Account
        caregiver_phone = "8888888888"
        result = await db.execute(select(User).where(User.phone == caregiver_phone))
        caregiver = result.scalars().first()

        if not caregiver:
            hashed_password = hash_password("caretaker123")  # Hash the password
            caregiver = User(
                name="Priya (Caregiver)",
                phone=caregiver_phone,
                role=UserRole.caregiver,
                password_hash=hashed_password,
                language="hi"
            )
            db.add(caregiver)
            await db.commit()
            await db.refresh(caregiver)
            print(f"👩‍⚕️ Created Caregiver: {caregiver.name} (ID: {caregiver.id})")
        else:
            print(f"👩‍⚕️ Using existing Caregiver: {caregiver.name} (ID: {caregiver.id})")

        # 3. Link Caregiver to Elder
        result = await db.execute(
            select(CaregiverLink).where(
                (CaregiverLink.elder_id == elder.id) & 
                (CaregiverLink.caregiver_id == caregiver.id)
            )
        )
        link = result.scalars().first()

        if not link:
            link = CaregiverLink(elder_id=elder.id, caregiver_id=caregiver.id)
            db.add(link)
            await db.commit()
            print(f"🔗 Linked {caregiver.name} → {elder.name}")
        else:
            print(f"🔗 Link already exists: {caregiver.name} → {elder.name}")

        # 4. Hybrid Data Patterns (7 Days)
        # We manually set values to hit every "if" statement in your detection code.
        
        # Day 1: Perfect Normal
        # Day 2: Normal
        # Day 3: Rising Sugar (High Warning)
        # Day 4: High BP (High Warning)
        # Day 5: Low Sugar (Hypoglycemia Warning)
        # Day 6: Low BP (Hypotension Warning)
        # Day 7: EMERGENCY Spike (Both Critical)

        hybrid_data = [
            # (Day Offset, Sugar, BP_Sys, BP_Dia)
            (6, 90, 120, 80),   # Day 1: Normal
            (5, 95, 118, 78),   # Day 2: Normal
            (4, 135, 122, 82),  # Day 3: Sugar High (>126) ⚠️
            (3, 140, 145, 95),  # Day 4: Sugar High + BP High (>140/90) ⚠️
            (2, 65, 142, 92),   # Day 5: Sugar LOW (<70) ⚠️ + BP High
            (1, 110, 85, 55),   # Day 6: Sugar Normal + BP LOW (<90/60) ⚠️
            (0, 310, 190, 110), # Day 7: Sugar EMERGENCY (>300) 🚨 + BP EMERGENCY (>180) 🚨
        ]

        end_date = datetime.utcnow()
        vitals_data = []

        for days_ago, sugar, sys, dia in hybrid_data:
            record_time = end_date - timedelta(days=days_ago)
            record_time = record_time.replace(hour=8, minute=30)

            # Add Sugar
            vitals_data.append(HealthVital(
                elder_id=elder.id,
                vital_type="sugar_fasting", # Explicitly 'fasting' to test that logic
                value=float(sugar),
                unit="mg/dL",
                source="manual",
                recorded_at=record_time
            ))

            # Add BP Systolic
            vitals_data.append(HealthVital(
                elder_id=elder.id,
                vital_type="bp_systolic",
                value=float(sys),
                unit="mmHg",
                source="manual",
                recorded_at=record_time
            ))

            # Add BP Diastolic
            vitals_data.append(HealthVital(
                elder_id=elder.id,
                vital_type="bp_diastolic",
                value=float(dia),
                unit="mmHg",
                source="manual",
                recorded_at=record_time
            ))

        # 5. Save to DB
        db.add_all(vitals_data)
        await db.commit()
        
        print(f"\n✅ Successfully seeded {len(vitals_data)} vital records for {elder.name}")
        print("\n" + "="*50)
        print("🧪 TEST CREDENTIALS")
        print("="*50)
        print(f"👴 Elder Account:")
        print(f"   Phone: {elder.phone}")
        print(f"   Password: test123")
        print(f"\n👩‍⚕️ Caregiver Account:")
        print(f"   Phone: {caregiver.phone}")
        print(f"   Password: caretaker123")
        print("="*50)

if __name__ == "__main__":
    asyncio.run(seed_data())
    print("✨ Data seeding complete!")