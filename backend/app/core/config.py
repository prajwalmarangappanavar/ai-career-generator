import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
env_path = BASE_DIR / ".env"
load_dotenv(dotenv_path=env_path)

class Settings:
    APP_NAME: str = os.getenv("APP_NAME", "CareerPulse AI - Personalized Career Content Generator")
    ENV: str = os.getenv("ENV", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1", "yes")
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "127.0.0.1")

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./careerpulse.db")

    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "careerpulse-super-secret-production-key-change-in-production-min-32-chars")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

    # AI Provider
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "local")  # "gemini", "openai", "local"
    AI_MODEL: str = os.getenv("AI_MODEL", "gemini-1.5-flash")

    # Admin
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "admin@careerpulse.ai")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "AdminSecurePassword123!")

settings = Settings()

