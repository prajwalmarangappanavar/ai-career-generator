from typing import List, Optional
from pydantic import BaseModel, Field

class EducationSchema(BaseModel):
    id: Optional[int] = None
    institution: str = Field(..., min_length=2)
    degree: str = Field(..., min_length=2)
    department: str = Field(..., min_length=2)
    graduation_year: int
    cgpa: Optional[str] = ""
    relevant_courses: Optional[str] = ""

class SkillSchema(BaseModel):
    id: Optional[int] = None
    name: str = Field(..., min_length=1)
    category: str = "technical"  # technical, soft, tool, database, framework
    proficiency: int = Field(3, ge=1, le=5)  # 1 to 5 scale
    years_experience: float = 1.0
    is_verified: bool = False

class ProjectSchema(BaseModel):
    id: Optional[int] = None
    title: str = Field(..., min_length=2)
    description: str = Field(..., min_length=10)
    technologies: str = ""
    role: str = "Developer"
    problem_statement: Optional[str] = ""
    outcomes: Optional[str] = ""
    project_url: Optional[str] = ""
    github_url: Optional[str] = ""
    is_featured: bool = True

class InternshipSchema(BaseModel):
    id: Optional[int] = None
    company: str = Field(..., min_length=2)
    position: str = Field(..., min_length=2)
    start_date: str = ""
    end_date: str = ""
    is_current: bool = False
    description: str = ""
    skills_applied: str = ""
    achievements: str = ""

class CertificationSchema(BaseModel):
    id: Optional[int] = None
    name: str = Field(..., min_length=2)
    issuing_org: str = Field(..., min_length=2)
    issue_date: str = ""
    credential_url: Optional[str] = ""
    credential_id: Optional[str] = ""

class CareerGoalSchema(BaseModel):
    target_role: str = "Software Developer"
    preferred_industry: str = "Technology"
    short_term_goals: str = ""
    long_term_goals: str = ""
    preferred_learning_style: str = "Hands-on Project & Practical"

class StudentProfileSchema(BaseModel):
    id: int
    user_id: int
    full_name: str
    email: str
    headline: str
    phone: str
    location: str
    bio: str
    completion_percentage: int
    career_readiness_score: int
    current_version: int
    educations: List[EducationSchema] = []
    skills: List[SkillSchema] = []
    projects: List[ProjectSchema] = []
    internships: List[InternshipSchema] = []
    certifications: List[CertificationSchema] = []
    career_goal: Optional[CareerGoalSchema] = None

class ProfileUpdateSchema(BaseModel):
    headline: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    educations: Optional[List[EducationSchema]] = None
    skills: Optional[List[SkillSchema]] = None
    projects: Optional[List[ProjectSchema]] = None
    internships: Optional[List[InternshipSchema]] = None
    certifications: Optional[List[CertificationSchema]] = None
    career_goal: Optional[CareerGoalSchema] = None
    change_summary: Optional[str] = "Profile updated by student"

