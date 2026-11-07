import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.models import LearningResource, SkillAssessment
from app.db.session import get_db
from app.schemas.interactive import AssessmentAnswerSubmit, AssessmentResultResponse

router = APIRouter(prefix="/learning", tags=["Learning & Resources"])

@router.get("/resources")
def get_learning_resources(skill: str = None, resource_type: str = None, db: Session = Depends(get_db)):
    """Retrieve verified learning resources with difficulty, duration, and direct verified URLs."""
    query = db.query(LearningResource)
    if resource_type:
        query = query.filter(LearningResource.resource_type == resource_type)

    all_res = query.all()
    results = []
    for r in all_res:
        skills = json.loads(r.skills_covered_json or "[]")
        if skill and not any(skill.lower() in s.lower() for s in skills):
            continue
        results.append({
            "id": r.id,
            "title": r.title,
            "provider": r.provider,
            "resource_type": r.resource_type,
            "url": r.url,
            "difficulty": r.difficulty,
            "duration_hours": r.duration_hours,
            "skills_covered": skills,
            "rating": r.rating,
            "is_verified": r.is_verified
        })
    return results

@router.get("/assessments")
def get_skill_assessments(skill: str = None, db: Session = Depends(get_db)):
    """Retrieve skill assessment questions."""
    query = db.query(SkillAssessment)
    if skill:
        query = query.filter(SkillAssessment.skill_name.ilike(f"%{skill}%"))
    items = query.all()
    out = []
    for q in items:
        out.append({
            "id": q.id,
            "skill_name": q.skill_name,
            "question": q.question,
            "options": json.loads(q.options_json),
            "difficulty": q.difficulty
        })
    return out

@router.post("/assessments/submit", response_model=AssessmentResultResponse)
def submit_assessment(sub: AssessmentAnswerSubmit, db: Session = Depends(get_db)):
    """Evaluate submitted quiz answer and return comprehensive explanation."""
    q = db.query(SkillAssessment).filter(SkillAssessment.id == sub.assessment_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Assessment question not found")

    is_correct = (sub.selected_option_index == q.correct_answer)
    return AssessmentResultResponse(
        is_correct=is_correct,
        correct_option_index=q.correct_answer,
        explanation=q.explanation,
        skill_name=q.skill_name
    )

