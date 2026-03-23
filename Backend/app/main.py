from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import init_db
from app.config import settings
from app.routers import alerts, checkins, dashboard, users, vitals, medications, voicebot

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield 
    
app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api")
app.include_router(checkins.router, prefix="/api")
app.include_router(vitals.router, prefix="/api")
app.include_router(alerts.router, prefix="/api")
app.include_router(medications.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(voicebot.router, prefix="/api")


@app.get("/")
async def root():
    return {
        "app": settings.app_name,
        "docs": "/docs",
        "health": "ok",
        "status": "NeuroNex Backend Running"
    }

from fastapi.responses import Response

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return Response(status_code=204)

@app.get("/test")
async def test_api():
    return {"message": "Backend connected successfully 🚀"}
