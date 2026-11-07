import pytest
from app.db.models import CareerRole, CareerRoleSkill, Skill, StudentProfile
from app.services.skill_gap_engine import skill_gap_engine

def test_skill_gap_analysis():
    profile = StudentProfile(current_version=1)
    profile.skills.append(Skill(name="Python", proficiency=4, category="technical"))
    profile.skills.append(Skill(name="SQL", proficiency=4, category="database"))

    role = CareerRole(title="AI/ML Engineer")
    role.skills.append(CareerRoleSkill(skill_name="Python", category="technical", required_proficiency=5, priority_level="essential"))
    role.skills.append(CareerRoleSkill(skill_name="SQL", category="database", required_proficiency=4, priority_level="essential"))
    role.skills.append(CareerRoleSkill(skill_name="Deep learning", category="technical", required_proficiency=4, priority_level="essential"))

    analysis = skill_gap_engine.analyze_skill_gap(profile, role, None)
    assert "overall_match_score" in analysis
    assert analysis["overall_match_score"] > 0
    assert len(analysis["existing_skills"]) >= 1
    assert len(analysis["missing_skills"]) >= 1
    assert "radar_chart_data" in analysis
    assert len(analysis["radar_chart_data"]["labels"]) == 5

