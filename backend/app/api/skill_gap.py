import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_current_student_profile
from app.db.models import CareerRole, SkillGapReport, StudentProfile
from app.db.session import get_db
from app.schemas.content import SkillGapAnalyzeRequest, SkillGapAnalyzeResponse
from app.services.skill_gap_engine import skill_gap_engine

router = APIRouter(prefix="/skill-gap", tags=["Skill Gap Analysis"])

@router.get("/roles")
def list_career_roles(db: Session = Depends(get_db)):
    """List all available standardized career roles with market data and required skills."""
    roles = db.query(CareerRole).all()
    out = []
    for r in roles:
        out.append({
            "id": r.id,
            "title": r.title,
            "category": r.category,
            "description": r.description,
            "average_salary": r.average_salary,
            "market_demand": r.market_demand,
            "growth_rate": r.growth_rate,
            "required_education": r.required_education,
            "skills_count": len(r.skills)
        })
    return out

@router.post("/analyze", response_model=SkillGapAnalyzeResponse)
def analyze_skill_gap(
    req: SkillGapAnalyzeRequest,
    profile: StudentProfile = Depends(get_current_student_profile),
    db: Session = Depends(get_db)
):
    """Analyze student skills against selected career role skill framework."""
    role = None
    if req.target_role_id:
        role = db.query(CareerRole).filter(CareerRole.id == req.target_role_id).first()
    elif req.target_role_name:
        role = db.query(CareerRole).filter(CareerRole.title == req.target_role_name).first()

    if not role:
        # Default to student's goal or first role in DB
        target_title = profile.career_goals.target_role if profile.career_goals else "AI/ML Engineer"
        role = db.query(CareerRole).filter(CareerRole.title == target_title).first()
        if not role:
            role = db.query(CareerRole).first()

    if not role:
        raise HTTPException(status_code=404, detail="No career role found to compare against.")

    analysis = skill_gap_engine.analyze_skill_gap(profile, role, db)

    # Persist Report in database
    report = SkillGapReport(
        profile_id=profile.id,
        career_role_id=role.id,
        target_role_name=role.title,
        overall_match_score=analysis["overall_match_score"],
        existing_skills_json=json.dumps(analysis["existing_skills"]),
        missing_skills_json=json.dumps(analysis["missing_skills"]),
        improvement_skills_json=json.dumps(analysis["improvement_skills"]),
        learning_sequence_json=json.dumps(analysis["learning_sequence"])
    )
    db.add(report)
    db.commit()

    return analysis

