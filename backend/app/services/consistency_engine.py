import json
import re
from datetime import datetime, timezone
from typing import Any, Dict, List, Set, Tuple
from sqlalchemy.orm import Session
from app.db.models import (
    GeneratedDocument,
    ProfileVersion,
    Resume,
    CoverLetter,
    StudentProfile,
    Skill,
    Education,
    Project,
    Internship,
    Certification
)

class ConsistencyEngine:
    """Centralized Student Career Profile Consistency & Anti-Fabrication Engine.

    Serves as the Single Source of Truth (SSOT) validator across all generated content.
    """

    @staticmethod
    def get_profile_facts(profile: StudentProfile) -> Dict[str, Any]:
        """Extract all verified canonical facts from the student's centralized profile."""
        skills = [s.name.strip() for s in profile.skills]
        degrees = [e.degree.strip() for e in profile.educations]
        institutions = [e.institution.strip() for e in profile.educations]
        projects = [p.title.strip() for p in profile.projects]
        internships = [i.company.strip() for i in profile.internships]
        certifications = [c.name.strip() for c in profile.certifications]
        target_role = profile.career_goals.target_role if profile.career_goals else "Software Developer"

        return {
            "full_name": profile.user.full_name if profile.user else "Student",
            "headline": profile.headline or "",
            "skills": skills,
            "degrees": degrees,
            "institutions": institutions,
            "projects": projects,
            "internships": internships,
            "certifications": certifications,
            "target_role": target_role,
            "version": profile.current_version
        }

    @staticmethod
    def create_profile_snapshot(profile: StudentProfile, db: Session, change_summary: str = "Profile update") -> ProfileVersion:
        """Create an immutable snapshot of the current profile state with version increment."""
        facts = ConsistencyEngine.get_profile_facts(profile)
        
        # Save snapshot
        version_record = ProfileVersion(
            profile_id=profile.id,
            version_number=profile.current_version,
            snapshot_json=json.dumps(facts),
            change_summary=change_summary,
            created_at=datetime.now(timezone.utc)
        )
        db.add(version_record)

        # Flag any existing documents that were tied to previous versions as outdated
        db.query(GeneratedDocument).filter(
            GeneratedDocument.profile_id == profile.id,
            GeneratedDocument.profile_version < profile.current_version
        ).update({"consistency_status": "outdated"}, synchronize_session=False)

        db.commit()
        return version_record

    @staticmethod
    def validate_content_against_profile(content_text: str, profile: StudentProfile) -> Dict[str, Any]:
        """Verify that generated text does not fabricate company names, degrees,

        certifications, or high-level qualifications outside the student's profile.
        """
        facts = ConsistencyEngine.get_profile_facts(profile)
        discrepancies: List[str] = []

        # Common hallucinated degrees to watch for if not in profile
        unverified_degrees = ["Ph.D.", "Doctor of Philosophy", "MBA", "Master of Business Administration"]
        for unverified in unverified_degrees:
            if unverified.lower() in content_text.lower():
                # check if student actually has it
                has_it = any(unverified.lower() in d.lower() for d in facts["degrees"])
                if not has_it:
                    discrepancies.append(f"Unverified qualification referenced: '{unverified}'")

        # Check for fabricated experience claims (e.g., claiming 10+ years experience for a student)
        years_match = re.findall(r'(\d+)\+?\s*years(?:\s+of)?\s+experience', content_text, re.IGNORECASE)
        for y_str in years_match:
            try:
                y = int(y_str)
                if y > 5:
                    discrepancies.append(f"Exaggerated experience claim: '{y} years of experience' exceeds verified profile background.")
            except ValueError:
                pass

        is_valid = len(discrepancies) == 0
        return {
            "is_valid": is_valid,
            "status": "verified" if is_valid else "flagged",
            "discrepancies": discrepancies,
            "profile_version": profile.current_version,
            "verified_skills_count": len(facts["skills"]),
            "verified_projects_count": len(facts["projects"])
        }

    @staticmethod
    def calculate_profile_completion(profile: StudentProfile) -> Tuple[int, int]:
        """Calculate Profile Completion % and Career Readiness Score (0-100)."""
        # Completion Score
        score = 0
        if profile.headline and len(profile.headline.strip()) > 5:
            score += 10
        if profile.bio and len(profile.bio.strip()) > 20:
            score += 10
        if profile.phone and profile.location:
            score += 5
        if profile.educations and len(profile.educations) > 0:
            score += 20
        if profile.skills and len(profile.skills) >= 3:
            score += 20
        if profile.projects and len(profile.projects) >= 1:
            score += 15
        if profile.internships and len(profile.internships) >= 1:
            score += 10
        if profile.certifications and len(profile.certifications) >= 1:
            score += 5
        if profile.career_goals and profile.career_goals.target_role:
            score += 5
        completion_pct = min(100, score)

        # Career Readiness Score
        # Transparent formula: Technical Skills (30%) + Projects (25%) + Education (15%) + Internships/Experience (20%) + Certs (10%)
        readiness = 0
        # Skills (up to 30)
        tech_skills = [s for s in profile.skills if s.category in ("technical", "framework", "database")]
        skill_pts = min(30, len(tech_skills) * 5)
        readiness += skill_pts

        # Projects (up to 25)
        proj_pts = min(25, len(profile.projects) * 12)
        readiness += proj_pts

        # Education & Academic Standing (up to 15)
        if profile.educations:
            readiness += 15

        # Internships (up to 20)
        intern_pts = min(20, len(profile.internships) * 15)
        readiness += intern_pts

        # Certifications (up to 10)
        cert_pts = min(10, len(profile.certifications) * 5)
        readiness += cert_pts

        readiness_score = min(100, readiness)
        return completion_pct, readiness_score

consistency_engine = ConsistencyEngine()

