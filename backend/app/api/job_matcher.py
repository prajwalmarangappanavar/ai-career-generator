import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_current_student_profile
from app.db.models import JobDescription, JobMatchReport, StudentProfile
from app.db.session import get_db
from app.schemas.content import JobDescriptionAnalyzeRequest, JobMatchResponse
from app.services.jd_analyzer_engine import jd_analyzer_engine

router = APIRouter(prefix="/job-matcher", tags=["Job Description Matcher"])

@router.post("/analyze", response_model=JobMatchResponse)
async def analyze_job_description(
    req: JobDescriptionAnalyzeRequest,
    profile: StudentProfile = Depends(get_current_student_profile),
    db: Session = Depends(get_db)
):
    """Analyze employer job description and produce tailored alignment report."""
    analysis = await jd_analyzer_engine.analyze_jd(
        job_title=req.job_title,
        company_name=req.company_name or "Target Company",
        jd_text=req.job_description_text,
        profile=profile
    )

    # Save job description
    jd = JobDescription(
        profile_id=profile.id,
        title=req.job_title,
        company=req.company_name or "Company",
        raw_text=req.job_description_text,
        extracted_skills_json=json.dumps(analysis["matching_skills"] + analysis["missing_skills"])
    )
    db.add(jd)
    db.flush()

    # Save report
    report = JobMatchReport(
        profile_id=profile.id,
        job_description_id=jd.id,
        match_score=analysis["match_score"],
        matching_skills_json=json.dumps(analysis["matching_skills"]),
        missing_skills_json=json.dumps(analysis["missing_skills"]),
        tailored_summary=analysis["tailored_summary"],
        recommendations_json=json.dumps(analysis["recommended_projects"])
    )
    db.add(report)
    db.commit()

    return JobMatchResponse(
        id=report.id,
        job_title=analysis["job_title"],
        company_name=analysis["company_name"],
        match_score=analysis["match_score"],
        matching_skills=analysis["matching_skills"],
        missing_skills=analysis["missing_skills"],
        tailored_summary=analysis["tailored_summary"],
        tailored_cover_letter=analysis["tailored_cover_letter"],
        recommended_projects=analysis["recommended_projects"],
        interview_questions=analysis["interview_questions"],
        disclaimer=analysis["disclaimer"]
    )

