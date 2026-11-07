import json
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_current_student_profile
from app.db.models import (
    InterviewFeedback,
    InterviewQuestion,
    MockInterview,
    StudentProfile
)
from app.db.session import get_db
from app.schemas.interactive import (
    AnswerFeedbackResponse,
    AnswerSubmitRequest,
    MockInterviewSessionResponse,
    MockInterviewStartRequest
)
from app.services.interview_engine import interview_engine

router = APIRouter(prefix="/interview", tags=["Interview Preparation & Mock Interview"])

@router.get("/questions")
def get_interview_questions(
    category: Optional[str] = None,
    target_role: Optional[str] = None,
    difficulty: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Retrieve curated interview questions across Technical, HR, Behavioral STAR, and Project categories."""
    query = db.query(InterviewQuestion)
    if category:
        query = query.filter(InterviewQuestion.category == category)
    if difficulty:
        query = query.filter(InterviewQuestion.difficulty == difficulty)

    items = query.all()
    out = []
    for q in items:
        out.append({
            "id": q.id,
            "category": q.category,
            "target_role": q.target_role,
            "question": q.question,
            "difficulty": q.difficulty,
            "sample_answer_framework": q.sample_answer_framework,
            "criteria": json.loads(q.evaluation_criteria_json or "[]")
        })
    return out

@router.post("/mock/start", response_model=MockInterviewSessionResponse)
def start_mock_interview(
    req: MockInterviewStartRequest,
    profile: StudentProfile = Depends(get_current_student_profile),
    db: Session = Depends(get_db)
):
    """Initialize a turn-by-turn interactive mock interview session."""
    session = MockInterview(
        profile_id=profile.id,
        target_role=req.target_role,
        interview_type=req.interview_type,
        overall_score=0,
        total_questions=req.total_questions,
        status="in_progress"
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    # Pick first question from DB
    first_q = db.query(InterviewQuestion).filter(
        (InterviewQuestion.target_role == req.target_role) | (InterviewQuestion.target_role == "General")
    ).first()

    if not first_q:
        first_q = db.query(InterviewQuestion).first()

    q_dict = {
        "id": first_q.id if first_q else 1,
        "category": first_q.category if first_q else "technical",
        "question": first_q.question if first_q else f"Tell me about your technical experience with {req.target_role}.",
        "difficulty": first_q.difficulty if first_q else "Intermediate"
    }

    return MockInterviewSessionResponse(
        mock_interview_id=session.id,
        target_role=session.target_role,
        current_question_index=1,
        total_questions=session.total_questions,
        current_question=q_dict
    )

@router.post("/mock/submit-answer", response_model=AnswerFeedbackResponse)
async def submit_mock_answer(
    req: AnswerSubmitRequest,
    profile: StudentProfile = Depends(get_current_student_profile),
    db: Session = Depends(get_db)
):
    """Evaluate student answer in real time and return rubric scores + next question."""
    session = db.query(MockInterview).filter(
        MockInterview.id == req.mock_interview_id,
        MockInterview.profile_id == profile.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Mock interview session not found")

    eval_result = await interview_engine.evaluate_answer(
        question_text=req.question_text,
        student_answer=req.student_answer,
        target_role=session.target_role
    )

    # Save feedback record
    feedback = InterviewFeedback(
        mock_interview_id=session.id,
        question_id=req.question_id,
        question_text=req.question_text,
        student_answer=req.student_answer,
        audio_transcript=req.audio_transcript or "",
        relevance_score=eval_result["relevance_score"],
        technical_score=eval_result["technical_score"],
        clarity_score=eval_result["clarity_score"],
        communication_score=eval_result["communication_score"],
        constructive_feedback=eval_result["constructive_feedback"],
        missing_concepts_json=json.dumps(eval_result["missing_concepts"])
    )
    db.add(feedback)

    # Count how many answered so far
    answered_count = db.query(InterviewFeedback).filter(InterviewFeedback.mock_interview_id == session.id).count() + 1

    next_q = None
    is_finished = answered_count >= session.total_questions

    if not is_finished:
        # Find next question from pool not already answered
        already_asked_ids = [f.question_id for f in session.feedbacks if f.question_id]
        if req.question_id:
            already_asked_ids.append(req.question_id)

        next_q_model = db.query(InterviewQuestion).filter(
            ~InterviewQuestion.id.in_(already_asked_ids)
        ).first()

        if next_q_model:
            next_q = {
                "id": next_q_model.id,
                "category": next_q_model.category,
                "question": next_q_model.question,
                "difficulty": next_q_model.difficulty
            }
        else:
            is_finished = True
    else:
        session.status = "completed"
        session.completed_at = datetime.now(timezone.utc)
        # Average score
        all_feedbacks = session.feedbacks
        if all_feedbacks:
            total_avg = sum((f.relevance_score + f.technical_score + f.clarity_score + f.communication_score) / 4 for f in all_feedbacks) / len(all_feedbacks)
            session.overall_score = int(total_avg * 10)  # scale 0-100

    db.commit()

    return AnswerFeedbackResponse(
        relevance_score=eval_result["relevance_score"],
        technical_score=eval_result["technical_score"],
        clarity_score=eval_result["clarity_score"],
        communication_score=eval_result["communication_score"],
        overall_score=eval_result["overall_score"],
        constructive_feedback=eval_result["constructive_feedback"],
        missing_concepts=eval_result["missing_concepts"],
        suggested_improvements=eval_result["suggested_improvements"],
        star_method_analysis=eval_result["star_method_analysis"],
        next_question=next_q,
        is_finished=is_finished
    )

@router.get("/mock/history")
def get_mock_history(
    profile: StudentProfile = Depends(get_current_student_profile),
    db: Session = Depends(get_db)
):
    """Retrieve history of completed mock interviews with full feedback transcripts."""
    sessions = db.query(MockInterview).filter(MockInterview.profile_id == profile.id).order_by(MockInterview.id.desc()).all()
    out = []
    for s in sessions:
        out.append({
            "id": s.id,
            "target_role": s.target_role,
            "interview_type": s.interview_type,
            "overall_score": s.overall_score,
            "total_questions": s.total_questions,
            "status": s.status,
            "started_at": s.started_at.isoformat() if s.started_at else "",
            "completed_at": s.completed_at.isoformat() if s.completed_at else "",
            "feedback_count": len(s.feedbacks)
        })
    return out

