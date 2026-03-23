from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "NeuroNex API"
    debug: bool = True

    # SQLite
    database_url: str = "sqlite+aiosqlite:///./neuronex.db"

    #PostgreSQL
    # database_url: str = "postgresql+asyncpg://postgres:abhishek@localhost:5432/Neuronex"
    
    # Gemini
    gemini_api_key: str = "AIzaSyA1fYUgycZ3ib2naBxkXwWWsKyrkv0CFCs"

    class Config:
        env_file = ".env"


settings = Settings()
