from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session
from app.db.models import CareerRole, CareerRoleSkill, SkillGapReport, StudentProfile

class SkillGapEngine:
    """Intelligent Skill-Gap Analyzer comparing student profile vs structured role framework."""

    @staticmethod
    def analyze_skill_gap(profile: StudentProfile, role: CareerRole, db: Session) -> Dict[str, Any]:
        student_skill_map = {s.name.lower().strip(): s for s in profile.skills}
        role_skills = role.skills

        existing_skills: List[Dict[str, Any]] = []
        missing_skills: List[Dict[str, Any]] = []
        improvement_skills: List[Dict[str, Any]] = []

        total_weight = 0.0
        earned_weight = 0.0

        # Weights by priority
        prio_weight = {
            "essential": 3.0,
            "important": 2.0,
            "nice_to_have": 1.0
        }

        radar_categories = {
            "Languages & Syntax": {"student": 0, "target": 0, "count": 0},
            "Frameworks & Tools": {"student": 0, "target": 0, "count": 0},
            "Data & Databases": {"student": 0, "target": 0, "count": 0},
            "Architecture & Cloud": {"student": 0, "target": 0, "count": 0},
            "Soft Skills & Communication": {"student": 0, "target": 0, "count": 0}
        }

        def categorize_radar(name: str, cat: str) -> str:
            nl = name.lower()
            if any(k in nl for k in ["python", "javascript", "typescript", "java", "c++", "bash"]):
                return "Languages & Syntax"
            if any(k in nl for k in ["react", "fastapi", "node", "django", "pytorch", "tensorflow", "git", "figma"]):
                return "Frameworks & Tools"
            if any(k in nl for k in ["sql", "data", "database", "pandas", "statistics", "analytics"]):
                return "Data & Databases"
            if any(k in nl for k in ["docker", "kubernetes", "cloud", "aws", "linux", "ci/cd", "security"]):
                return "Architecture & Cloud"
            return "Soft Skills & Communication"

        for r_skill in role_skills:
            weight = prio_weight.get(r_skill.priority_level, 2.0)
            target_prof = r_skill.required_proficiency
            total_weight += weight * target_prof

            match = None
            for s_name, s_obj in student_skill_map.items():
                if s_name in r_skill.skill_name.lower() or r_skill.skill_name.lower() in s_name:
                    match = s_obj
                    break

            radar_cat = categorize_radar(r_skill.skill_name, r_skill.category)
            radar_categories[radar_cat]["target"] += target_prof
            radar_categories[radar_cat]["count"] += 1

            if match:
                curr_prof = match.proficiency
                earned_weight += weight * min(curr_prof, target_prof)
                radar_categories[radar_cat]["student"] += curr_prof

                skill_item = {
                    "skill_name": r_skill.skill_name,
                    "category": r_skill.category,
                    "student_proficiency": curr_prof,
                    "required_proficiency": target_prof,
                    "priority_level": r_skill.priority_level,
                    "gap": max(0, target_prof - curr_prof),
                    "is_verified": match.is_verified
                }

                if curr_prof >= target_prof:
                    skill_item["status"] = "matched"
                    existing_skills.append(skill_item)
                else:
                    skill_item["status"] = "needs_improvement"
                    improvement_skills.append(skill_item)
            else:
                missing_item = {
                    "skill_name": r_skill.skill_name,
                    "category": r_skill.category,
                    "student_proficiency": 0,
                    "required_proficiency": target_prof,
                    "priority_level": r_skill.priority_level,
                    "gap": target_prof,
                    "status": "missing",
                    "is_verified": False
                }
                missing_skills.append(missing_item)

        # Calculate Overall Match Score (0 - 100)
        overall_match = int((earned_weight / total_weight * 100)) if total_weight > 0 else 50
        overall_match = max(10, min(99, overall_match))

        # Recommended learning sequence (Prioritize essential missing first, then essential improvements, then others)
        sequence: List[str] = []
        for m in sorted(missing_skills, key=lambda x: (x["priority_level"] != "essential", -x["gap"])):
            sequence.append(f"1. Master Foundational: {m['skill_name']} ({m['priority_level'].capitalize()})")
        for imp in sorted(improvement_skills, key=lambda x: (x["priority_level"] != "essential", -x["gap"])):
            sequence.append(f"2. Level-Up: {imp['skill_name']} from Level {imp['student_proficiency']} to {imp['required_proficiency']}")

        # Prepare Radar Chart normalized points (0 - 100)
        radar_labels = list(radar_categories.keys())
        student_scores = []
        target_scores = []

        for k in radar_labels:
            data = radar_categories[k]
            max_possible = data["count"] * 5 if data["count"] > 0 else 5
            s_val = int((data["student"] / max_possible) * 100) if max_possible > 0 else 40
            t_val = int((data["target"] / max_possible) * 100) if max_possible > 0 else 90
            student_scores.append(min(100, max(15, s_val)))
            target_scores.append(min(100, max(60, t_val)))

        radar_chart_data = {
            "labels": radar_labels,
            "student_scores": student_scores,
            "target_scores": target_scores
        }

        return {
            "target_role": role.title,
            "overall_match_score": overall_match,
            "existing_skills": existing_skills,
            "missing_skills": missing_skills,
            "improvement_skills": improvement_skills,
            "learning_sequence": sequence[:8],
            "radar_chart_data": radar_chart_data,
            "profile_version": profile.current_version
        }

skill_gap_engine = SkillGapEngine()

