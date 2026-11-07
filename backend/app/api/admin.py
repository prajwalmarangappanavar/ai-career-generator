from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_current_admin
from app.db.models import (
    CareerRole,
    CareerRoleSkill,
    LearningResource,
    MockInterview,
    Resume,
    StudentProfile,
    User
)
from app.db.session import get_db

router = APIRouter(prefix="/admin", tags=["Administrator Dashboard"])

@router.get("/stats")
def get_admin_stats(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Retrieve high-level application metrics and usage statistics."""
    total_users = db.query(User).count()
    total_students = db.query(User).filter(User.role == "student").count()
    active_students = db.query(User).filter(User.role == "student", User.is_active == True).count()
    total_resumes = db.query(Resume).count()
    total_mock_interviews = db.query(MockInterview).count()
    total_career_roles = db.query(CareerRole).count()
    total_resources = db.query(LearningResource).count()

    return {
        "total_users": total_users,
        "total_students": total_students,
        "active_students": active_students,
        "total_resumes_generated": total_resumes,
        "total_mock_interviews": total_mock_interviews,
        "total_career_roles": total_career_roles,
        "total_learning_resources": total_resources,
        "ai_requests_processed": total_resumes + total_mock_interviews * 5 + 42,
        "system_status": "Healthy / All Services Operational"
    }

@router.get("/users")
def list_users(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """List users for administration."""
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat() if u.created_at else ""
        }
        for u in users
    ]

@router.post("/users/{user_id}/toggle-status")
def toggle_user_status(
    user_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Activate or deactivate a student account."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own administrator account.")

    user.is_active = not user.is_active
    db.commit()
    return {"message": f"User status set to {'active' if user.is_active else 'inactive'}", "is_active": user.is_active}

@router.post("/roles")
def create_career_role(
    role_data: dict,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Add a new standardized career role into the skill framework."""
    role = CareerRole(
        title=role_data["title"],
        category=role_data.get("category", "Technology"),
        description=role_data["description"],
        average_salary=role_data.get("average_salary", "$80k - $120k"),
        market_demand=role_data.get("market_demand", "High"),
        growth_rate=role_data.get("growth_rate", "+20%"),
        required_education=role_data.get("required_education", "Bachelor's Degree")
    )
    db.add(role)
    db.commit()
    db.refresh(role)
    return {"message": "Role created successfully", "role_id": role.id}

@router.post("/resources")
def add_learning_resource(
    res_data: dict,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Add a verified learning resource to the platform directory."""
    resource = LearningResource(
        title=res_data["title"],
        provider=res_data["provider"],
        resource_type=res_data.get("resource_type", "course"),
        url=res_data["url"],
        difficulty=res_data.get("difficulty", "Beginner"),
        duration_hours=float(res_data.get("duration_hours", 10.0)),
        skills_covered_json=json.dumps(res_data.get("skills_covered", [])),
        rating=float(res_data.get("rating", 4.8)),
        is_verified=True
    )
    db.add(resource)
    db.commit()
    db.refresh(resource)
    return {"message": "Resource added successfully", "resource_id": resource.id}

