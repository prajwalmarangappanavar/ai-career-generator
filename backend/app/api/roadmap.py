import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_current_student_profile
from app.db.models import LearningRoadmap, RoadmapTask, StudentProfile
from app.db.session import get_db
from app.schemas.content import RoadmapGenerateRequest, RoadmapResponse
from app.services.roadmap_engine import roadmap_engine

router = APIRouter(prefix="/roadmap", tags=["Career Roadmap"])

@router.post("/generate", response_model=RoadmapResponse)
def generate_roadmap(
    req: RoadmapGenerateRequest,
    profile: StudentProfile = Depends(get_current_student_profile),
    db: Session = Depends(get_db)
):
    """Generate or retrieve a customized career roadmap for the selected timeframe."""
    roadmap = roadmap_engine.generate_roadmap(profile, req.target_role, req.timeframe, db)
    return _build_roadmap_response(roadmap)

@router.get("/current", response_model=RoadmapResponse)
def get_current_roadmap(
    timeframe: str = "90_days",
    profile: StudentProfile = Depends(get_current_student_profile),
    db: Session = Depends(get_db)
):
    """Get active roadmap for current student."""
    target_role = profile.career_goals.target_role if profile.career_goals else "Full-Stack Software Developer"
    roadmap = roadmap_engine.generate_roadmap(profile, target_role, timeframe, db)
    return _build_roadmap_response(roadmap)

@router.post("/task/{task_id}/toggle")
def toggle_task_completion(
    task_id: int,
    profile: StudentProfile = Depends(get_current_student_profile),
    db: Session = Depends(get_db)
):
    """Mark a roadmap task as completed or pending and update milestone progress."""
    task = db.query(RoadmapTask).join(LearningRoadmap).filter(
        RoadmapTask.id == task_id,
        LearningRoadmap.profile_id == profile.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Roadmap task not found")

    task.is_completed = not task.is_completed
    task.completed_at = datetime.now(timezone.utc) if task.is_completed else None

    # Update completed_milestones count on roadmap
    roadmap = task.roadmap
    completed_count = db.query(RoadmapTask).filter(
        RoadmapTask.roadmap_id == roadmap.id,
        RoadmapTask.is_completed == True
    ).count()
    roadmap.completed_milestones = completed_count

    db.commit()
    return {"task_id": task.id, "is_completed": task.is_completed, "completed_milestones": completed_count}

@router.put("/task/{task_id}/notes")
def update_task_notes(
    task_id: int,
    data: dict,
    profile: StudentProfile = Depends(get_current_student_profile),
    db: Session = Depends(get_db)
):
    """Update student notes or deadline on a roadmap task."""
    task = db.query(RoadmapTask).join(LearningRoadmap).filter(
        RoadmapTask.id == task_id,
        LearningRoadmap.profile_id == profile.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Roadmap task not found")

    if "notes" in data:
        task.notes = data["notes"]
    if "deadline" in data:
        task.deadline = data["deadline"]

    db.commit()
    return {"message": "Task updated successfully", "task_id": task.id}

def _build_roadmap_response(roadmap: LearningRoadmap) -> dict:
    tasks = []
    for t in sorted(roadmap.tasks, key=lambda x: x.week_number):
        tasks.append({
            "id": t.id,
            "week_number": t.week_number,
            "title": t.title,
            "description": t.description,
            "skill_target": t.skill_target,
            "resource_links": json.loads(t.resource_links_json or "[]"),
            "is_completed": t.is_completed,
            "notes": t.notes or "",
            "deadline": t.deadline or ""
        })

    return {
        "id": roadmap.id,
        "target_role": roadmap.target_role,
        "timeframe": roadmap.timeframe,
        "total_milestones": roadmap.total_milestones,
        "completed_milestones": roadmap.completed_milestones,
        "tasks": tasks
    }

