from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import bcrypt

from app.database import get_db
from app.models import User, UserRole, CaregiverLink
# 👇 CHANGE: Import UserLogin here
from app.schemas import UserCreate, UserResponse, CaregiverLinkCreate, UserLogin 

router = APIRouter(prefix="/users", tags=["users"])

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

# --- 1. REGISTRATION (Keep as is) ---
@router.post("/register", response_model=UserResponse)
async def register_user(data: UserCreate, db: AsyncSession = Depends(get_db)):
    # ... (Your existing registration code is fine) ...
    # ... (Ensure you keep the full code here) ...
    existing = await db.execute(select(User).where(User.phone == data.phone))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Phone number already registered")

    hashed_password = hash_password(data.password)

    user = User(
        name=data.name,
        phone=data.phone,
        role=data.role,
        language=data.language,
        password_hash=hashed_password,
    )
    db.add(user)
    await db.flush()

    if data.role == UserRole.elder.value and data.caregiver_id:
        link = CaregiverLink(elder_id=user.id, caregiver_id=data.caregiver_id)
        db.add(link)

    await db.commit()
    await db.refresh(user)
    return user

# --- 2. LOGIN (Fixed) ---
# 👇 CHANGE: Use UserLogin schema here
@router.post("/login", response_model=UserResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)): 
    """Simplified login check: finds user and verifies hashed password."""
    
    # 1. Find user by phone number
    result = await db.execute(select(User).where(User.phone == data.phone))
    user = result.scalar_one_or_none()
    
    # 2. Verify existence and verify hashed password
    if not user:
        raise HTTPException(status_code=400, detail="Invalid phone or password")
        
    if not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid phone or password")
        
    return user

# --- 3. UTILS (Keep as is) ---
@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(404, "User not found")
    return user

@router.post("/caregiver-link", response_model=dict)
async def link_caregiver(data: CaregiverLinkCreate, db: AsyncSession = Depends(get_db)):
    """Link a caregiver to an elder."""
    
    # 1. Verify both users exist
    elder_result = await db.execute(select(User).where(User.id == data.elder_id))
    elder = elder_result.scalar_one_or_none()
    if not elder:
        raise HTTPException(status_code=404, detail="Elder not found")
    
    caregiver_result = await db.execute(select(User).where(User.id == data.caregiver_id))
    caregiver = caregiver_result.scalar_one_or_none()
    if not caregiver:
        raise HTTPException(status_code=404, detail="Caregiver not found")
    
    # 2. Verify caregiver role
    if caregiver.role != "caregiver":
        raise HTTPException(status_code=400, detail="User is not a caregiver")
    
    # 3. Check if link already exists
    existing_result = await db.execute(
        select(CaregiverLink).where(
            (CaregiverLink.elder_id == data.elder_id) & 
            (CaregiverLink.caregiver_id == data.caregiver_id)
        )
    )
    if existing_result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Link already exists")
    
    # 4. Create link
    link = CaregiverLink(elder_id=data.elder_id, caregiver_id=data.caregiver_id)
    db.add(link)
    await db.commit()
    
    return {
        "status": "linked",
        "elder_id": data.elder_id,
        "elder_name": elder.name,
        "caregiver_id": data.caregiver_id,
        "caregiver_name": caregiver.name
    }


@router.get("/caregiver/{caregiver_id}/elders", response_model=dict)
async def get_caregiver_elders(caregiver_id: int, db: AsyncSession = Depends(get_db)):
    """Get all elders linked to a caregiver."""
    
    # Check caregiver exists
    caregiver_result = await db.execute(select(User).where(User.id == caregiver_id))
    caregiver = caregiver_result.scalar_one_or_none()
    if not caregiver:
        raise HTTPException(status_code=404, detail="Caregiver not found")
    
    # Get linked elders
    result = await db.execute(
        select(User).join(
            CaregiverLink,
            CaregiverLink.elder_id == User.id
        ).where(CaregiverLink.caregiver_id == caregiver_id)
    )
    elders = result.scalars().all()
    
    return {
        "caregiver_id": caregiver_id,
        "caregiver_name": caregiver.name,
        "elders": [
            {"id": e.id, "name": e.name, "phone": e.phone}
            for e in elders
        ]
    }


@router.delete("/caregiver-link/{elder_id}/{caregiver_id}", response_model=dict)
async def unlink_caregiver(elder_id: int, caregiver_id: int, db: AsyncSession = Depends(get_db)):
    """Remove a caregiver link from an elder."""
    
    result = await db.execute(
        select(CaregiverLink).where(
            (CaregiverLink.elder_id == elder_id) & 
            (CaregiverLink.caregiver_id == caregiver_id)
        )
    )
    link = result.scalar_one_or_none()
    
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    
    await db.delete(link)
    await db.commit()
    
    return {"status": "unlinked", "elder_id": elder_id, "caregiver_id": caregiver_id}