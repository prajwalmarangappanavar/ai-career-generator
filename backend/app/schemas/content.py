from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class CareerProfileGenerateRequest(BaseModel):
    version_profile_type: str = "entry_level"  # fresher, internship, entry_level, technical, non_technical, research
    tone: str = "Professional"  # Professional, Formal, Concise, Technical, Beginner-friendly

class CareerProfileGenerateResponse(BaseModel):
    professional_introduction: str
    resume_summary: str
    career_objective: str
    linkedin_about: str
    personal_branding_statement: str
    strengths_analysis: Dict[str, Any]
    suitability_analysis: Dict[str, Any]
    profile_version: int
    is_live_ai: bool = False
    ai_engine_used: str = "local_heuristic"

class SkillGapAnalyzeRequest(BaseModel):
    target_role_id: Optional[int] = None
    target_role_name: Optional[str] = None

class SkillItem(BaseModel):
    skill_name: str
    category: str
    student_proficiency: int
    required_proficiency: int
    priority_level: str  # essential, important, nice_to_have
    gap: int
    status: str  # matched, needs_improvement, missing

class SkillGapAnalyzeResponse(BaseModel):
    target_role: str
    overall_match_score: int
    existing_skills: List[SkillItem]
    missing_skills: List[SkillItem]
    improvement_skills: List[SkillItem]
    learning_sequence: List[str]
    radar_chart_data: Dict[str, Any]
    profile_version: int

class RoadmapGenerateRequest(BaseModel):
    target_role: str
    timeframe: str = "90_days"  # 30_days, 60_days, 90_days, 6_months, 1_year

class RoadmapTaskSchema(BaseModel):
    id: Optional[int] = None
    week_number: int
    title: str
    description: str
    skill_target: str
    resource_links: List[Dict[str, str]] = []
    is_completed: bool = False
    notes: Optional[str] = ""
    deadline: Optional[str] = ""

class RoadmapResponse(BaseModel):
    id: int
    target_role: str
    timeframe: str
    total_milestones: int
    completed_milestones: int
    tasks: List[RoadmapTaskSchema]

class ResumeGenerateRequest(BaseModel):
    target_role: Optional[str] = None
    template_name: str = "modern"  # modern, professional, minimalist, creative
    tone: str = "Professional"
    target_job_description: Optional[str] = None

class ResumeResponse(BaseModel):
    id: int
    title: str
    template_name: str
    target_role: str
    professional_summary: str
    content: Dict[str, Any]
    ats_score: int
    ats_feedback: Dict[str, Any]
    profile_version: int
    is_consistent: bool = True

class CoverLetterGenerateRequest(BaseModel):
    target_company: str = Field(..., min_length=2)
    target_role: str = Field(..., min_length=2)
    job_description: Optional[str] = ""
    letter_type: str = "fresher"  # fresher, internship, entry_level, experienced
    tone: str = "Professional"

class CoverLetterResponse(BaseModel):
    id: int
    target_company: str
    target_role: str
    tone: str
    content: str
    profile_version: int

class JobDescriptionAnalyzeRequest(BaseModel):
    job_title: str
    company_name: Optional[str] = "Company"
    job_description_text: str = Field(..., min_length=20)

class JobMatchResponse(BaseModel):
    id: int
    job_title: str
    company_name: str
    match_score: int
    matching_skills: List[str]
    missing_skills: List[str]
    tailored_summary: str
    tailored_cover_letter: str
    recommended_projects: List[Dict[str, Any]]
    interview_questions: List[str]
    disclaimer: str

class ChatMessage(BaseModel):
    role: str  # user, assistant
    content: str
    timestamp: Optional[str] = None

class ChatRequest(BaseModel):
    conversation_id: Optional[int] = None
    message: str = Field(..., min_length=1)

class ChatResponse(BaseModel):
    conversation_id: int
    reply: str
    suggested_followups: List[str]
    is_live_ai: bool = False

