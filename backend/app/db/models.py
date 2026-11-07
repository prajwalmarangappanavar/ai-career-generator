from datetime import datetime, timezone
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from app.db.session import Base

def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="student", nullable=False)  # student, admin
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    # Relationships
    profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    chatbot_conversations = relationship("ChatbotConversation", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    headline = Column(String(255), default="")
    phone = Column(String(50), default="")
    location = Column(String(100), default="")
    bio = Column(Text, default="")
    completion_percentage = Column(Integer, default=20)
    career_readiness_score = Column(Integer, default=25)
    current_version = Column(Integer, default=1)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    # Relationships
    user = relationship("User", back_populates="profile")
    educations = relationship("Education", back_populates="profile", cascade="all, delete-orphan")
    skills = relationship("Skill", back_populates="profile", cascade="all, delete-orphan")
    interests = relationship("Interest", back_populates="profile", cascade="all, delete-orphan")
    career_goals = relationship("CareerGoal", back_populates="profile", uselist=False, cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="profile", cascade="all, delete-orphan")
    certifications = relationship("Certification", back_populates="profile", cascade="all, delete-orphan")
    internships = relationship("Internship", back_populates="profile", cascade="all, delete-orphan")
    skill_gap_reports = relationship("SkillGapReport", back_populates="profile", cascade="all, delete-orphan")
    roadmaps = relationship("LearningRoadmap", back_populates="profile", cascade="all, delete-orphan")
    resumes = relationship("Resume", back_populates="profile", cascade="all, delete-orphan")
    cover_letters = relationship("CoverLetter", back_populates="profile", cascade="all, delete-orphan")
    mock_interviews = relationship("MockInterview", back_populates="profile", cascade="all, delete-orphan")
    job_descriptions = relationship("JobDescription", back_populates="profile", cascade="all, delete-orphan")
    job_match_reports = relationship("JobMatchReport", back_populates="profile", cascade="all, delete-orphan")
    generated_documents = relationship("GeneratedDocument", back_populates="profile", cascade="all, delete-orphan")
    profile_versions = relationship("ProfileVersion", back_populates="profile", cascade="all, delete-orphan")


class Education(Base):
    __tablename__ = "education"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    institution = Column(String(255), nullable=False)
    degree = Column(String(150), nullable=False)
    department = Column(String(150), nullable=False)
    graduation_year = Column(Integer, nullable=False)
    cgpa = Column(String(50), default="")
    relevant_courses = Column(Text, default="")
    created_at = Column(DateTime, default=utcnow)

    profile = relationship("StudentProfile", back_populates="educations")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    category = Column(String(50), default="technical")  # technical, soft, tool, database, framework
    proficiency = Column(Integer, default=3)  # 1 (Beginner) to 5 (Expert)
    years_experience = Column(Float, default=1.0)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)

    profile = relationship("StudentProfile", back_populates="skills")


class Interest(Base):
    __tablename__ = "interests"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    interest_name = Column(String(150), nullable=False)
    category = Column(String(100), default="General")

    profile = relationship("StudentProfile", back_populates="interests")


class CareerGoal(Base):
    __tablename__ = "career_goals"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), unique=True, nullable=False)
    target_role = Column(String(150), default="Software Developer")
    preferred_industry = Column(String(150), default="Information Technology")
    short_term_goals = Column(Text, default="")
    long_term_goals = Column(Text, default="")
    preferred_learning_style = Column(String(100), default="Hands-on Project & Practical")

    profile = relationship("StudentProfile", back_populates="career_goals")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    technologies = Column(String(255), default="")  # comma separated
    role = Column(String(100), default="Lead Developer")
    problem_statement = Column(Text, default="")
    outcomes = Column(Text, default="")
    project_url = Column(String(255), default="")
    github_url = Column(String(255), default="")
    is_featured = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)

    profile = relationship("StudentProfile", back_populates="projects")


class Certification(Base):
    __tablename__ = "certifications"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(200), nullable=False)
    issuing_org = Column(String(200), nullable=False)
    issue_date = Column(String(50), default="")
    credential_url = Column(String(255), default="")
    credential_id = Column(String(100), default="")

    profile = relationship("StudentProfile", back_populates="certifications")


class Internship(Base):
    __tablename__ = "internships"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    company = Column(String(200), nullable=False)
    position = Column(String(150), nullable=False)
    start_date = Column(String(50), default="")
    end_date = Column(String(50), default="")
    is_current = Column(Boolean, default=False)
    description = Column(Text, default="")
    skills_applied = Column(String(255), default="")
    achievements = Column(Text, default="")

    profile = relationship("StudentProfile", back_populates="internships")


class CareerRole(Base):
    __tablename__ = "career_roles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), unique=True, nullable=False)
    category = Column(String(100), default="Engineering")
    description = Column(Text, nullable=False)
    average_salary = Column(String(100), default="$85,000 - $125,000 / ₹8 - ₹18 LPA")
    market_demand = Column(String(50), default="High")
    growth_rate = Column(String(50), default="+22% next 5 years")
    required_education = Column(String(200), default="Bachelor's in Computer Science or related field")

    skills = relationship("CareerRoleSkill", back_populates="role", cascade="all, delete-orphan")


class CareerRoleSkill(Base):
    __tablename__ = "career_role_skills"

    id = Column(Integer, primary_key=True, index=True)
    career_role_id = Column(Integer, ForeignKey("career_roles.id", ondelete="CASCADE"), nullable=False)
    skill_name = Column(String(100), nullable=False)
    category = Column(String(50), default="technical")
    required_proficiency = Column(Integer, default=4)  # 1 to 5
    priority_level = Column(String(50), default="essential")  # essential, important, nice_to_have

    role = relationship("CareerRole", back_populates="skills")


class SkillAssessment(Base):
    __tablename__ = "skill_assessments"

    id = Column(Integer, primary_key=True, index=True)
    skill_name = Column(String(100), index=True, nullable=False)
    question = Column(Text, nullable=False)
    options_json = Column(Text, nullable=False)  # JSON array of 4 options
    correct_answer = Column(Integer, nullable=False)  # index 0-3
    explanation = Column(Text, nullable=False)
    difficulty = Column(String(50), default="Intermediate")


class SkillGapReport(Base):
    __tablename__ = "skill_gap_reports"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    career_role_id = Column(Integer, ForeignKey("career_roles.id"), nullable=True)
    target_role_name = Column(String(150), nullable=False)
    overall_match_score = Column(Integer, default=0)
    existing_skills_json = Column(Text, default="[]")
    missing_skills_json = Column(Text, default="[]")
    improvement_skills_json = Column(Text, default="[]")
    learning_sequence_json = Column(Text, default="[]")
    created_at = Column(DateTime, default=utcnow)

    profile = relationship("StudentProfile", back_populates="skill_gap_reports")


class LearningResource(Base):
    __tablename__ = "learning_resources"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    provider = Column(String(150), nullable=False)
    resource_type = Column(String(50), default="course")  # course, tutorial, documentation, youtube, book
    url = Column(String(500), nullable=False)
    difficulty = Column(String(50), default="Beginner")
    duration_hours = Column(Float, default=10.0)
    skills_covered_json = Column(Text, default="[]")
    rating = Column(Float, default=4.8)
    is_verified = Column(Boolean, default=True)


class LearningRoadmap(Base):
    __tablename__ = "learning_roadmaps"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    target_role = Column(String(150), nullable=False)
    timeframe = Column(String(50), default="90_days")  # 30_days, 60_days, 90_days, 6_months, 1_year
    total_milestones = Column(Integer, default=12)
    completed_milestones = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)

    profile = relationship("StudentProfile", back_populates="roadmaps")
    tasks = relationship("RoadmapTask", back_populates="roadmap", cascade="all, delete-orphan")


class RoadmapTask(Base):
    __tablename__ = "roadmap_tasks"

    id = Column(Integer, primary_key=True, index=True)
    roadmap_id = Column(Integer, ForeignKey("learning_roadmaps.id", ondelete="CASCADE"), nullable=False)
    week_number = Column(Integer, nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, default="")
    skill_target = Column(String(100), default="")
    resource_links_json = Column(Text, default="[]")
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    notes = Column(Text, default="")
    deadline = Column(String(50), default="")

    roadmap = relationship("LearningRoadmap", back_populates="tasks")


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    profile_version = Column(Integer, default=1)
    title = Column(String(200), default="Software Engineer Resume")
    template_name = Column(String(50), default="modern")  # modern, professional, minimalist, creative
    target_role = Column(String(150), default="Software Developer")
    professional_summary = Column(Text, default="")
    content_json = Column(Text, nullable=False)  # full structured resume data
    ats_score = Column(Integer, default=85)
    ats_feedback_json = Column(Text, default="{}")
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    profile = relationship("StudentProfile", back_populates="resumes")


class CoverLetter(Base):
    __tablename__ = "cover_letters"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    profile_version = Column(Integer, default=1)
    target_company = Column(String(200), nullable=False)
    target_role = Column(String(150), nullable=False)
    job_description_snippet = Column(Text, default="")
    content = Column(Text, nullable=False)
    tone = Column(String(50), default="Professional")
    created_at = Column(DateTime, default=utcnow)

    profile = relationship("StudentProfile", back_populates="cover_letters")


class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(50), nullable=False)  # technical, hr, behavioral, project
    target_role = Column(String(150), nullable=False)
    question = Column(Text, nullable=False)
    difficulty = Column(String(50), default="Intermediate")
    sample_answer_framework = Column(Text, default="")
    evaluation_criteria_json = Column(Text, default="[]")


class MockInterview(Base):
    __tablename__ = "mock_interviews"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    target_role = Column(String(150), nullable=False)
    interview_type = Column(String(50), default="Technical & Behavioral")
    overall_score = Column(Integer, default=0)
    total_questions = Column(Integer, default=5)
    status = Column(String(50), default="in_progress")  # in_progress, completed
    started_at = Column(DateTime, default=utcnow)
    completed_at = Column(DateTime, nullable=True)

    profile = relationship("StudentProfile", back_populates="mock_interviews")
    feedbacks = relationship("InterviewFeedback", back_populates="mock_interview", cascade="all, delete-orphan")


class InterviewFeedback(Base):
    __tablename__ = "interview_feedback"

    id = Column(Integer, primary_key=True, index=True)
    mock_interview_id = Column(Integer, ForeignKey("mock_interviews.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(Integer, nullable=True)
    question_text = Column(Text, nullable=False)
    student_answer = Column(Text, nullable=False)
    audio_transcript = Column(Text, default="")
    relevance_score = Column(Integer, default=8)  # 1-10
    technical_score = Column(Integer, default=8)  # 1-10
    clarity_score = Column(Integer, default=8)  # 1-10
    communication_score = Column(Integer, default=8)  # 1-10
    constructive_feedback = Column(Text, default="")
    missing_concepts_json = Column(Text, default="[]")

    mock_interview = relationship("MockInterview", back_populates="feedbacks")


class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    company = Column(String(200), default="Prospective Employer")
    raw_text = Column(Text, nullable=False)
    extracted_skills_json = Column(Text, default="[]")
    extracted_responsibilities_json = Column(Text, default="[]")
    created_at = Column(DateTime, default=utcnow)

    profile = relationship("StudentProfile", back_populates="job_descriptions")
    match_reports = relationship("JobMatchReport", back_populates="job_description", cascade="all, delete-orphan")


class JobMatchReport(Base):
    __tablename__ = "job_match_reports"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    job_description_id = Column(Integer, ForeignKey("job_descriptions.id", ondelete="CASCADE"), nullable=False)
    match_score = Column(Integer, default=70)
    matching_skills_json = Column(Text, default="[]")
    missing_skills_json = Column(Text, default="[]")
    tailored_summary = Column(Text, default="")
    recommendations_json = Column(Text, default="[]")
    created_at = Column(DateTime, default=utcnow)

    profile = relationship("StudentProfile", back_populates="job_match_reports")
    job_description = relationship("JobDescription", back_populates="match_reports")


class GeneratedDocument(Base):
    __tablename__ = "generated_documents"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    profile_version = Column(Integer, default=1)
    document_type = Column(String(50), nullable=False)  # resume, cover_letter, summary, gap_report, roadmap
    title = Column(String(255), nullable=False)
    file_format = Column(String(20), default="pdf")  # pdf, docx, json
    file_path = Column(String(500), default="")
    consistency_status = Column(String(50), default="verified")  # verified, outdated, flagged
    created_at = Column(DateTime, default=utcnow)

    profile = relationship("StudentProfile", back_populates="generated_documents")


class ProfileVersion(Base):
    __tablename__ = "profile_versions"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    version_number = Column(Integer, nullable=False)
    snapshot_json = Column(Text, nullable=False)
    change_summary = Column(String(255), default="Profile update")
    created_at = Column(DateTime, default=utcnow)

    profile = relationship("StudentProfile", back_populates="profile_versions")


class ChatbotConversation(Base):
    __tablename__ = "chatbot_conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), default="Career Guidance Session")
    messages_json = Column(Text, default="[]")  # array of {role, content, timestamp, suggestions}
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    user = relationship("User", back_populates="chatbot_conversations")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="milestone")  # milestone, profile, recommendation, alert
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="notifications")

