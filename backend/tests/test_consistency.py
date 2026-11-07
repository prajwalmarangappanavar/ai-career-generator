import pytest
from app.db.models import StudentProfile, User, Education, Skill
from app.services.consistency_engine import consistency_engine

def test_profile_completion_calculation():
    user = User(email="test@example.com", full_name="Student Name")
    profile = StudentProfile(
        user=user,
        headline="Software Developer",
        bio="Experienced student engineer with Python background.",
        phone="+91 9999999999",
        location="Bengaluru",
        current_version=1
    )
    profile.educations.append(Education(
        institution="NIT",
        degree="B.Tech",
        department="CSE",
        graduation_year=2026
    ))
    profile.skills.append(Skill(name="Python", proficiency=4, category="technical"))
    profile.skills.append(Skill(name="SQL", proficiency=4, category="database"))
    profile.skills.append(Skill(name="React", proficiency=3, category="framework"))

    comp, readiness = consistency_engine.calculate_profile_completion(profile)
    assert comp >= 60
    assert readiness >= 30

def test_anti_fabrication_validator():
    user = User(email="alex@example.com", full_name="Alex Sharma")
    profile = StudentProfile(
        user=user,
        headline="Aspiring Engineer",
        current_version=1
    )
    profile.educations.append(Education(institution="NIT", degree="B.Tech", department="CSE", graduation_year=2026))
    profile.skills.append(Skill(name="Python", proficiency=4))

    # Test 1: Legitimate text
    legit_text = "Alex is a B.Tech graduate from NIT with experience in Python."
    res1 = consistency_engine.validate_content_against_profile(legit_text, profile)
    assert res1["is_valid"] is True
    assert len(res1["discrepancies"]) == 0

    # Test 2: Fabricated PhD or 12 years experience
    fabricated_text = "Alex holds a Ph.D. with 12 years of experience in enterprise systems."
    res2 = consistency_engine.validate_content_against_profile(fabricated_text, profile)
    assert res2["is_valid"] is False
    assert len(res2["discrepancies"]) >= 1

