import json
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from app.api.deps import get_current_student_profile
from app.db.models import (
    CoverLetter,
    GeneratedDocument,
    LearningRoadmap,
    Resume,
    SkillGapReport,
    StudentProfile
)
from app.db.session import get_db
from app.services.ats_resume_engine import ats_resume_engine
from app.services.doc_export_service import doc_export_service

router = APIRouter(prefix="/export", tags=["Export Center"])

@router.get("/resume/pdf")
def export_resume_pdf(
    resume_id: int = None,
    profile: StudentProfile = Depends(get_current_student_profile),
    db: Session = Depends(get_db)
):
    """Download verified ATS-friendly resume as PDF."""
    if resume_id:
        resume = db.query(Resume).filter(Resume.id == resume_id, Resume.profile_id == profile.id).first()
    else:
        resume = db.query(Resume).filter(Resume.profile_id == profile.id).first()

    if not resume:
        # Generate fresh resume data
        res_data = ats_resume_engine.generate_resume_data(profile)
        resume_data = res_data["resume_data"]
    else:
        resume_data = json.loads(resume.content_json)

    pdf_bytes = doc_export_service.generate_resume_pdf(resume_data)
    filename = f"{profile.user.full_name.replace(' ', '_')}_Resume.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@router.get("/resume/docx")
def export_resume_docx(
    resume_id: int = None,
    profile: StudentProfile = Depends(get_current_student_profile),
    db: Session = Depends(get_db)
):
    """Download editable ATS resume as Word DOCX document."""
    if resume_id:
        resume = db.query(Resume).filter(Resume.id == resume_id, Resume.profile_id == profile.id).first()
    else:
        resume = db.query(Resume).filter(Resume.profile_id == profile.id).first()

    if not resume:
        res_data = ats_resume_engine.generate_resume_data(profile)
        resume_data = res_data["resume_data"]
    else:
        resume_data = json.loads(resume.content_json)

    docx_bytes = doc_export_service.generate_resume_docx(resume_data)
    filename = f"{profile.user.full_name.replace(' ', '_')}_Resume.docx"

    return Response(
        content=docx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@router.get("/cover-letter/pdf")
def export_cover_letter_pdf(
    cover_letter_id: int = None,
    profile: StudentProfile = Depends(get_current_student_profile),
    db: Session = Depends(get_db)
):
    """Download cover letter as PDF."""
    if cover_letter_id:
        letter = db.query(CoverLetter).filter(CoverLetter.id == cover_letter_id, CoverLetter.profile_id == profile.id).first()
    else:
        letter = db.query(CoverLetter).filter(CoverLetter.profile_id == profile.id).order_by(CoverLetter.id.desc()).first()

    if not letter:
        raise HTTPException(status_code=404, detail="No cover letter generated yet. Please generate one first.")

    payload = {
        "student_name": profile.user.full_name,
        "student_email": profile.user.email,
        "student_phone": profile.phone,
        "target_company": letter.target_company,
        "target_role": letter.target_role,
        "content": letter.content
    }

    pdf_bytes = doc_export_service.generate_cover_letter_pdf(payload)
    filename = f"Cover_Letter_{letter.target_company.replace(' ', '_')}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@router.get("/skill-gap/pdf")
def export_skill_gap_pdf(
    profile: StudentProfile = Depends(get_current_student_profile),
    db: Session = Depends(get_db)
):
    """Download the latest skill-gap analysis report as PDF."""
    report = db.query(SkillGapReport).filter(SkillGapReport.profile_id == profile.id).order_by(SkillGapReport.id.desc()).first()
    if not report:
        raise HTTPException(status_code=404, detail="No skill gap report found. Run an analysis first.")

    data = {
        "target_role": report.target_role_name,
        "overall_match_score": report.overall_match_score,
        "existing_skills": json.loads(report.existing_skills_json or "[]"),
        "missing_skills": json.loads(report.missing_skills_json or "[]"),
        "improvement_skills": json.loads(report.improvement_skills_json or "[]"),
        "learning_sequence": json.loads(report.learning_sequence_json or "[]")
    }

    pdf_bytes = doc_export_service.generate_skill_gap_pdf(data)
    filename = f"Skill_Gap_Report_{report.target_role_name.replace(' ', '_')}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

