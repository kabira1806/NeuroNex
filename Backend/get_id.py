import asyncio
import sys
from pathlib import Path

sys.path.insert(0, r"c:\Users\Divyam Gulgulia\.gemini\antigravity\scratch\NeuroNex\Backend")
from app.config import settings
from app.models import CaregiverLink, User
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select

async def main():
    engine = create_async_engine(settings.database_url, echo=False)
    AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(CaregiverLink))
        links = result.scalars().all()
        for link in links:
            print(f"Elder ID: {link.elder_id} -> Caretaker ID: {link.caregiver_id}")

asyncio.run(main())
