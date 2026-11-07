import json
from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_current_student_profile, get_current_user
from app.db.models import (
    CareerGoal,
    Certification,
    Education,
    Internship,
    ProfileVersion,
    Project,
    Skill,
    StudentProfile,
    User
)
from app.db.session import get_db
from app.schemas.profile import ProfileUpdateSchema, StudentProfileSchema
from app.services.consistency_engine import consistency_engine

router = APIRouter(prefix="/profile", tags=["Student Profile"])

@router.get("", response_model=StudentProfileSchema)
def get_my_profile(
    profile: StudentProfile = Depends(get_current_student_profile),
    db: Session = Depends(get_db)
):
    """Retrieve full centralized student career profile."""
    # recalculate completion & readiness
    comp, ready = consistency_engine.calculate_profile_completion(profile)
    profile.completion_percentage = comp
    profile.career_readiness_score = ready
    db.commit()

    return _build_profile_response(profile)

@router.put("", response_model=StudentProfileSchema)
def update_profile(
    update_data: ProfileUpdateSchema,
    profile: StudentProfile = Depends(get_current_student_profile),
    db: Session = Depends(get_db)
):
    """Update profile with atomic version increment and snapshot creation."""
    if update_data.headline is not None:
        profile.headline = update_data.headline
    if update_data.phone is not None:
        profile.phone = update_data.phone
    if update_data.location is not None:
        profile.location = update_data.location
    if update_data.bio is not None:
        profile.bio = update_data.bio

    # Update Education
    if update_data.educations is not None:
        db.query(Education).filter(Education.profile_id == profile.id).delete()
        for edu in update_data.educations:
            db.add(Education(
                profile_id=profile.id,
                institution=edu.institution,
                degree=edu.degree,
                department=edu.department,
                graduation_year=edu.graduation_year,
                cgpa=edu.cgpa or "",
                relevant_courses=edu.relevant_courses or ""
            ))

    # Update Skills
    if update_data.skills is not None:
        db.query(Skill).filter(Skill.profile_id == profile.id).delete()
        for s in update_data.skills:
            db.add(Skill(
                profile_id=profile.id,
                name=s.name.strip(),
                category=s.category,
                proficiency=s.proficiency,
                years_experience=s.years_experience,
                is_verified=s.is_verified
            ))

    # Update Projects
    if update_data.projects is not None:
        db.query(Project).filter(Project.profile_id == profile.id).delete()
        for p in update_data.projects:
            db.add(Project(
                profile_id=profile.id,
                title=p.title,
                description=p.description,
                technologies=p.technologies,
                role=p.role,
                problem_statement=p.problem_statement or "",
                outcomes=p.outcomes or "",
                project_url=p.project_url or "",
                github_url=p.github_url or "",
                is_featured=p.is_featured
            ))

    # Update Internships
    if update_data.internships is not None:
        db.query(Internship).filter(Internship.profile_id == profile.id).delete()
        for i in update_data.internships:
            db.add(Internship(
                profile_id=profile.id,
                company=i.company,
                position=i.position,
                start_date=i.start_date,
                end_date=i.end_date,
                is_current=i.is_current,
                description=i.description,
                skills_applied=i.skills_applied,
                achievements=i.achievements
            ))

    # Update Certifications
    if update_data.certifications is not None:
        db.query(Certification).filter(Certification.profile_id == profile.id).delete()
        for c in update_data.certifications:
            db.add(Certification(
                profile_id=profile.id,
                name=c.name,
                issuing_org=c.issuing_org,
                issue_date=c.issue_date,
                credential_url=c.credential_url or "",
                credential_id=c.credential_id or ""
            ))

    # Update Career Goal
    if update_data.career_goal is not None:
        goal = db.query(CareerGoal).filter(CareerGoal.profile_id == profile.id).first()
        if not goal:
            goal = CareerGoal(profile_id=profile.id)
            db.add(goal)
        goal.target_role = update_data.career_goal.target_role
        goal.preferred_industry = update_data.career_goal.preferred_industry
        goal.short_term_goals = update_data.career_goal.short_term_goals
        goal.long_term_goals = update_data.career_goal.long_term_goals
        goal.preferred_learning_style = update_data.career_goal.preferred_learning_style

    # Increment Version and Create Snapshot
    profile.current_version += 1
    comp, ready = consistency_engine.calculate_profile_completion(profile)
    profile.completion_percentage = comp
    profile.career_readiness_score = ready

    db.commit()
    db.refresh(profile)

    # Snapshot creation & document staleness marking
    consistency_engine.create_profile_snapshot(
        profile,
        db,
        change_summary=update_data.change_summary or f"Version {profile.current_version} update"
    )

    return _build_profile_response(profile)

@router.get("/versions")
def get_version_history(
    profile: StudentProfile = Depends(get_current_student_profile),
    db: Session = Depends(get_db)
):
    """Retrieve all profile versions and snapshots."""
    versions = db.query(ProfileVersion).filter(ProfileVersion.profile_id == profile.id).order_by(ProfileVersion.version_number.desc()).all()
    res = []
    for v in versions:
        res.append({
            "version_number": v.version_number,
            "change_summary": v.change_summary,
            "created_at": v.created_at.isoformat() if v.created_at else "",
            "snapshot": json.loads(v.snapshot_json)
        })
    return res

def _build_profile_response(profile: StudentProfile) -> Dict[str, Any]:
    goal = profile.career_goals
    goal_dict = None
    if goal:
        goal_dict = {
            "target_role": goal.target_role,
            "preferred_industry": goal.preferred_industry,
            "short_term_goals": goal.short_term_goals,
            "long_term_goals": goal.long_term_goals,
            "preferred_learning_style": goal.preferred_learning_style
        }

    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "full_name": profile.user.full_name if profile.user else "",
        "email": profile.user.email if profile.user else "",
        "headline": profile.headline or "",
        "phone": profile.phone or "",
        "location": profile.location or "",
        "bio": profile.bio or "",
        "completion_percentage": profile.completion_percentage or 20,
        "career_readiness_score": profile.career_readiness_score or 25,
        "current_version": profile.current_version or 1,
        "educations": [
            {
                "id": e.id,
                "institution": e.institution,
                "degree": e.degree,
                "department": e.department,
                "graduation_year": e.graduation_year,
                "cgpa": e.cgpa,
                "relevant_courses": e.relevant_courses
            }
            for e in profile.educations
        ],
        "skills": [
            {
                "id": s.id,
                "name": s.name,
                "category": s.category,
                "proficiency": s.proficiency,
                "years_experience": s.years_experience,
                "is_verified": s.is_verified
            }
            for s in profile.skills
        ],
        "projects": [
            {
                "id": p.id,
                "title": p.title,
                "description": p.description,
                "technologies": p.technologies,
                "role": p.role,
                "problem_statement": p.problem_statement,
                "outcomes": p.outcomes,
                "project_url": p.project_url,
                "github_url": p.github_url,
                "is_featured": p.is_featured
            }
            for p in profile.projects
        ],
        "internships": [
            {
                "id": i.id,
                "company": i.company,
                "position": i.position,
                "start_date": i.start_date,
                "end_date": i.end_date,
                "is_current": i.is_current,
                "description": i.description,
                "skills_applied": i.skills_applied,
                "achievements": i.achievements
            }
            for i in profile.internships
        ],
        "certifications": [
            {
                "id": c.id,
                "name": c.name,
                "issuing_org": c.issuing_org,
                "issue_date": c.issue_date,
                "credential_url": c.credential_url,
                "credential_id": c.credential_id
            }
            for c in profile.certifications
        ],
        "career_goal": goal_dict
    }

