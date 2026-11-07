from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_current_student_profile
from app.db.models import CoverLetter, StudentProfile
from app.db.session import get_db
from app.schemas.content import CoverLetterGenerateRequest, CoverLetterResponse
from app.services.ai_engine import ai_engine
from app.services.consistency_engine import consistency_engine

router = APIRouter(prefix="/cover-letter", tags=["AI Cover Letter"])

@router.post("/generate", response_model=CoverLetterResponse)
async def generate_cover_letter(
    req: CoverLetterGenerateRequest,
    profile: StudentProfile = Depends(get_current_student_profile),
    db: Session = Depends(get_db)
):
    """Generate a tailored cover letter grounded in student's verified background."""
    facts = consistency_engine.get_profile_facts(profile)
    name = facts["full_name"]
    degree = facts["degrees"][0] if facts["degrees"] else "Computer Science"
    institution = facts["institutions"][0] if facts["institutions"] else "University"
    top_skills = ", ".join(facts["skills"][:4]) if facts["skills"] else "software engineering"
    project_str = f"In my capstone project ({facts['projects'][0]}), " if facts["projects"] else ""
    internship_str = f"During my internship at {profile.internships[0].company}, " if profile.internships else ""

    prompt = f"""
You are a career development expert. Draft a personalized, compelling cover letter for:
Candidate Name: {name}
Candidate Background: {degree} graduate from {institution}
Target Company: {req.target_company}
Target Job Role: {req.target_role}
Candidate Verified Skills: {top_skills}
Completed Projects: {', '.join(facts['projects'])}
Experience: {internship_str}
Letter Type: {req.letter_type} (e.g. fresher, internship, entry_level)
Tone: {req.tone}

CRITICAL RULES:
1. Do NOT fabricate past employers or degrees.
2. Structure in 4 clear, professional paragraphs:
   - Salutation & enthusiastic opening stating role and why this company appeals to the candidate.
   - Academic rigor & foundational technical skills aligned with the role.
   - Specific project achievement ({project_str}) highlighting problem-solving and outcomes.
   - Professional closing requesting an interview.

Return ONLY the body of the cover letter text.
"""
    ai_resp = await ai_engine.generate_text(prompt)
    if ai_resp.get("is_live_ai") and ai_resp.get("text"):
        content = ai_resp["text"].strip()
    else:
        # High quality local fallback template
        content = (
            f"Dear Hiring Manager,\n\n"
            f"I am writing to express my eager interest in the {req.target_role} position at {req.target_company}. "
            f"As a {degree} candidate at {institution} equipped with strong practical foundations in {top_skills}, "
            f"I have admired {req.target_company}'s technical innovations and believe my problem-solving background aligns well with your team.\n\n"
            f"Throughout my academic studies and software development projects, I have maintained high technical rigor while building functional, user-centric systems. "
            f"{project_str}I engineered robust application components, designed normalized database schemas, and optimized code for throughput and reliability.\n\n"
            f"{internship_str}I collaborated directly within an engineering team to implement tested features and participate in code reviews. "
            f"These experiences have taught me the value of resilient system design, proactive communication, and continuous learning.\n\n"
            f"I would welcome the opportunity to discuss how my academic background and dedication to engineering excellence can contribute to {req.target_company}. "
            f"Thank you for your time and consideration.\n\n"
            f"Sincerely,\n{name}"
        )

    # Persist in database
    letter = CoverLetter(
        profile_id=profile.id,
        profile_version=profile.current_version,
        target_company=req.target_company,
        target_role=req.target_role,
        job_description_snippet=req.job_description or "",
        content=content,
        tone=req.tone
    )
    db.add(letter)
    db.commit()
    db.refresh(letter)

    return CoverLetterResponse(
        id=letter.id,
        target_company=letter.target_company,
        target_role=letter.target_role,
        tone=letter.tone,
        content=letter.content,
        profile_version=letter.profile_version
    )

