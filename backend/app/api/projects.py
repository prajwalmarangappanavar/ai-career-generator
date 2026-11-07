from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_current_student_profile
from app.db.models import Project, StudentProfile
from app.db.session import get_db
from app.services.consistency_engine import consistency_engine
from app.services.project_engine import project_engine

router = APIRouter(prefix="/projects", tags=["Project Recommendations"])

@router.get("/recommendations")
def get_project_recommendations(
    target_role: str = None,
    profile: StudentProfile = Depends(get_current_student_profile)
):
    """Retrieve curated portfolio projects tailored to student skill level and target role."""
    role = target_role or (profile.career_goals.target_role if profile.career_goals else "Full-Stack Software Developer")
    return project_engine.get_recommendations(profile, role)

@router.post("/adopt/{title}")
def add_recommended_project_to_profile(
    title: str,
    profile: StudentProfile = Depends(get_current_student_profile),
    db: Session = Depends(get_db)
):
    """Add a recommended project directly into the student's centralized career profile."""
    role = profile.career_goals.target_role if profile.career_goals else "Full-Stack Software Developer"
    recs = project_engine.get_recommendations(profile, role)

    matched = next((p for p in recs if p["title"].lower() == title.lower()), None)
    if not matched:
        raise HTTPException(status_code=404, detail="Project not found in recommendations.")

    # Check if already in profile
    exists = db.query(Project).filter(
        Project.profile_id == profile.id,
        Project.title == matched["title"]
    ).first()

    if exists:
        return {"message": "Project already exists in profile", "project_id": exists.id}

    proj = Project(
        profile_id=profile.id,
        title=matched["title"],
        description=matched["description"],
        technologies=matched["technologies"],
        role="Lead Architect & Developer",
        problem_statement=matched["problem_statement"],
        outcomes=matched["expected_outcome"]
    )
    db.add(proj)

    profile.current_version += 1
    consistency_engine.create_profile_snapshot(profile, db, f"Added project: {matched['title']}")
    db.commit()

    return {"message": "Project successfully added to your career profile!", "project_id": proj.id}

