import os
import sys
from pathlib import Path
import uvicorn

# Add backend directory to sys.path
backend_path = Path(__file__).resolve().parent / "backend"
sys.path.insert(0, str(backend_path))

from app.core.config import settings

if __name__ == "__main__":
    print(f"🚀 Starting {settings.APP_NAME}...")
    print(f"🌐 Access Web Application: http://{settings.HOST}:{settings.PORT}")
    print(f"📚 API Documentation: http://{settings.HOST}:{settings.PORT}/docs")
    print(f"👤 Demo Student Login: student@example.com / StudentPassword123!")
    print(f"🔑 Admin Login: {settings.ADMIN_EMAIL} / {settings.ADMIN_PASSWORD}")

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=False
    )

