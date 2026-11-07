import pytest
from app.db.session import SessionLocal
from app.db.models import User, StudentProfile
from app.api.auth import login
from app.schemas.auth import UserLogin
from app.api.skill_gap import list_career_roles, analyze_skill_gap
from app.schemas.content import SkillGapAnalyzeRequest
from app.api.admin import get_admin_stats

def test_login_and_roles_direct():
    db = SessionLocal()
    try:
        # Test student login
        login_in = UserLogin(email="student@example.com", password="StudentPassword123!")
        token = login(login_in, db)
        assert token.access_token is not None
        assert token.role == "student"

        # Test listing roles
        roles = list_career_roles(db)
        assert len(roles) >= 5
        role_titles = [r["title"] for r in roles]
        assert "AI/ML Engineer" in role_titles

        # Test skill gap analysis
        student = db.query(User).filter(User.email == "student@example.com").first()
        req = SkillGapAnalyzeRequest(target_role_name="AI/ML Engineer")
        gap_report = analyze_skill_gap(req, student.profile, db)
        assert gap_report["overall_match_score"] > 0
        assert len(gap_report["existing_skills"]) > 0

        # Test admin stats
        admin = db.query(User).filter(User.email == "admin@careerpulse.ai").first()
        stats = get_admin_stats(admin, db)
        assert stats["total_students"] >= 1
        assert stats["total_career_roles"] >= 5
    finally:
        db.close()
