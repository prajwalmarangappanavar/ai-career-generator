from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class MockInterviewStartRequest(BaseModel):
    target_role: str
    interview_type: str = "Technical & Behavioral"
    total_questions: int = 5

class MockInterviewSessionResponse(BaseModel):
    mock_interview_id: int
    target_role: str
    current_question_index: int
    total_questions: int
    current_question: Dict[str, Any]

class AnswerSubmitRequest(BaseModel):
    mock_interview_id: int
    question_id: Optional[int] = None
    question_text: str
    student_answer: str = Field(..., min_length=2)
    audio_transcript: Optional[str] = ""

class AnswerFeedbackResponse(BaseModel):
    relevance_score: int  # 1-10
    technical_score: int  # 1-10
    clarity_score: int  # 1-10
    communication_score: int  # 1-10
    overall_score: int  # 1-10
    constructive_feedback: str
    missing_concepts: List[str]
    suggested_improvements: str
    star_method_analysis: Dict[str, Any]
    next_question: Optional[Dict[str, Any]] = None
    is_finished: bool = False

class AssessmentAnswerSubmit(BaseModel):
    assessment_id: int
    selected_option_index: int

class AssessmentResultResponse(BaseModel):
    is_correct: bool
    correct_option_index: int
    explanation: str
    skill_name: str

