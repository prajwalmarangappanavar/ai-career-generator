from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_current_student_profile
from app.db.models import StudentProfile
from app.db.session import get_db
from app.schemas.content import CareerProfileGenerateRequest, CareerProfileGenerateResponse
from app.services.career_profile_engine import career_profile_engine

router = APIRouter(prefix="/career-content", tags=["Career Content Generation"])

@router.post("/generate", response_model=CareerProfileGenerateResponse)
async def generate_career_content(
    req: CareerProfileGenerateRequest,
    profile: StudentProfile = Depends(get_current_student_profile)
):
    """Generate professional summary, objective, LinkedIn About, strengths, and suitability

    strictly grounded in the student's centralized profile facts.
    """
    res = await career_profile_engine.generate_career_content(
        profile=profile,
        profile_type=req.version_profile_type,
        tone=req.tone
    )
    return res

