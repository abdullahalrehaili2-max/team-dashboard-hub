from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./data/app.db"
    JWT_SECRET: str = "change-me-in-production-secret-key-32chars"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24 * 7  # 1 week

    ADMIN_EMAIL: str = "admin@example.com"
    ADMIN_PASSWORD: str = "changeme"

    PUBLIC_BASE_URL: str = "http://localhost:8000"
    WEEK_STARTS_ON: str = "monday"
    BIG_MOVE_THRESHOLD_PCT: float = 10.0
    DEFAULT_THEME: str = "gastat_executive"

    # AI Suggester
    AI_SUGGESTER_PROVIDER: str = "auto"  # auto | anthropic | openai | rules
    ANTHROPIC_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None

    UPLOADS_DIR: str = "./uploads"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
