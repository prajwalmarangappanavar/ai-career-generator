import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_current_student_profile
from app.db.models import Resume, StudentProfile
from app.db.session import get_db
from app.schemas.content import ResumeGenerateRequest, ResumeResponse
from app.services.ats_resume_engine import ats_resume_engine
from app.services.consistency_engine import consistency_engine

router = APIRouter(prefix="/resume", tags=["AI Resume Builder"])

@router.post("/generate", response_model=ResumeResponse)
def generate_resume(
    req: ResumeGenerateRequest,
    profile: StudentProfile = Depends(get_current_student_profile),
    db: Session = Depends(get_db)
):
    """Generate structured ATS-compliant resume linked to current verified profile."""
    res_data = ats_resume_engine.generate_resume_data(
        profile=profile,
        template_name=req.template_name,
        target_role=req.target_role
    )

    resume_payload = res_data["resume_data"]
    ats_score = res_data["ats_score"]
    ats_feedback = res_data["ats_feedback"]

    # Verify consistency against profile facts
    content_str = json.dumps(resume_payload)
    val = consistency_engine.validate_content_against_profile(content_str, profile)

    # Persist or update resume
    resume_rec = db.query(Resume).filter(
        Resume.profile_id == profile.id,
        Resume.template_name == req.template_name
    ).first()

    if not resume_rec:
        resume_rec = Resume(
            profile_id=profile.id,
            profile_version=profile.current_version,
            title=f"{resume_payload.get('target_role', 'Software')} Resume ({req.template_name.title()})",
            template_name=req.template_name,
            target_role=resume_payload.get('target_role', 'Software Developer'),
            professional_summary=resume_payload.get('summary', ''),
            content_json=json.dumps(resume_payload),
            ats_score=ats_score,
            ats_feedback_json=json.dumps(ats_feedback)
        )
        db.add(resume_rec)
    else:
        resume_rec.profile_version = profile.current_version
        resume_rec.target_role = resume_payload.get('target_role', 'Software Developer')
        resume_rec.professional_summary = resume_payload.get('summary', '')
        resume_rec.content_json = json.dumps(resume_payload)
        resume_rec.ats_score = ats_score
        resume_rec.ats_feedback_json = json.dumps(ats_feedback)

    db.commit()
    db.refresh(resume_rec)

    return ResumeResponse(
        id=resume_rec.id,
        title=resume_rec.title,
        template_name=resume_rec.template_name,
        target_role=resume_rec.target_role,
        professional_summary=resume_rec.professional_summary,
        content=resume_payload,
        ats_score=ats_score,
        ats_feedback=ats_feedback,
        profile_version=resume_rec.profile_version,
        is_consistent=val["is_valid"]
    )

@router.get("/latest", response_model=ResumeResponse)
def get_latest_resume(
    template: str = "modern",
    profile: StudentProfile = Depends(get_current_student_profile),
    db: Session = Depends(get_db)
):
    """Retrieve active resume or generate if not exists."""
    resume_rec = db.query(Resume).filter(
        Resume.profile_id == profile.id,
        Resume.template_name == template
    ).first()

    if not resume_rec:
        req = ResumeGenerateRequest(template_name=template)
        return generate_resume(req, profile, db)

    content = json.loads(resume_rec.content_json)
    feedback = json.loads(resume_rec.ats_feedback_json or "{}")

    # Check if profile was updated since resume was created
    is_consistent = (resume_rec.profile_version == profile.current_version)

    return ResumeResponse(
        id=resume_rec.id,
        title=resume_rec.title,
        template_name=resume_rec.template_name,
        target_role=resume_rec.target_role,
        professional_summary=resume_rec.professional_summary,
        content=content,
        ats_score=resume_rec.ats_score,
        ats_feedback=feedback,
        profile_version=resume_rec.profile_version,
        is_consistent=is_consistent
    )

@router.put("/{resume_id}")
def update_resume_content(
    resume_id: int,
    payload: dict,
    profile: StudentProfile = Depends(get_current_student_profile),
    db: Session = Depends(get_db)
):
    """Save user edits to resume content and recalculate ATS score."""
    resume_rec = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.profile_id == profile.id
    ).first()

    if not resume_rec:
        raise HTTPException(status_code=404, detail="Resume not found")

    new_content = payload.get("content", {})
    new_ats = ats_resume_engine.analyze_ats_compatibility(new_content, resume_rec.target_role)

    resume_rec.content_json = json.dumps(new_content)
    resume_rec.ats_score = new_ats["ats_score"]
    resume_rec.ats_feedback_json = json.dumps(new_ats)
    if "summary" in new_content:
        resume_rec.professional_summary = new_content["summary"]

    db.commit()
    return {"message": "Resume updated", "ats_score": new_ats["ats_score"], "ats_feedback": new_ats}

