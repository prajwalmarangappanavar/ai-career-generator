import json
import re
from typing import Any, Dict, List, Optional
from app.db.models import Resume, StudentProfile
from app.services.consistency_engine import consistency_engine

class ATSResumeEngine:
    """ATS Resume Generator and Keyword Coverage Analyzer."""

    @staticmethod
    def generate_resume_data(profile: StudentProfile, template_name: str = "modern", target_role: Optional[str] = None) -> Dict[str, Any]:
        facts = consistency_engine.get_profile_facts(profile)
        role = target_role or facts["target_role"] or "Software Developer"

        # Categorize Skills
        tech_skills = [s.name for s in profile.skills if s.category in ("technical", "tool", "framework", "database")]
        soft_skills = [s.name for s in profile.skills if s.category == "soft"]

        # Projects formatting with enhanced action-driven bullets
        formatted_projects = []
        for p in profile.projects:
            formatted_projects.append({
                "title": p.title,
                "role": p.role,
                "technologies": p.technologies,
                "description": p.description,
                "problem_statement": p.problem_statement or "",
                "outcomes": p.outcomes or "",
                "github_url": p.github_url or "",
                "bullets": ATSResumeEngine._enhance_project_bullets(p.description, p.outcomes)
            })

        # Experience / Internships
        formatted_internships = []
        for i in profile.internships:
            formatted_internships.append({
                "company": i.company,
                "position": i.position,
                "duration": f"{i.start_date} - {'Present' if i.is_current else i.end_date}",
                "description": i.description,
                "skills_applied": i.skills_applied,
                "achievements": i.achievements,
                "bullets": ATSResumeEngine._enhance_internship_bullets(i.description, i.achievements)
            })

        # Education
        formatted_education = []
        for e in profile.educations:
            formatted_education.append({
                "institution": e.institution,
                "degree": e.degree,
                "department": e.department,
                "graduation_year": e.graduation_year,
                "cgpa": e.cgpa,
                "relevant_courses": e.relevant_courses
            })

        # Certifications
        formatted_certs = []
        for c in profile.certifications:
            formatted_certs.append({
                "name": c.name,
                "issuing_org": c.issuing_org,
                "issue_date": c.issue_date,
                "credential_id": c.credential_id
            })

        # Summary
        edu_summary = f"{formatted_education[0]['degree']} from {formatted_education[0]['institution']}" if formatted_education else "Engineering graduate"
        skills_summary = ", ".join(tech_skills[:4]) if tech_skills else "software development"
        summary = f"Ambitious and detail-oriented {role} with foundational background in {edu_summary}. Proven proficiency in {skills_summary} through end-to-end project engineering and academic performance. Demonstrates strong analytical problem solving and cross-functional team collaboration."

        resume_payload = {
            "personal_info": {
                "full_name": profile.user.full_name if profile.user else "Alex Sharma",
                "email": profile.user.email if profile.user else "alex@example.com",
                "phone": profile.phone or "+91 98765 43210",
                "location": profile.location or "Bengaluru, India",
                "headline": profile.headline or f"Aspiring {role}"
            },
            "target_role": role,
            "template_name": template_name,
            "summary": summary,
            "technical_skills": tech_skills,
            "soft_skills": soft_skills,
            "projects": formatted_projects,
            "internships": formatted_internships,
            "education": formatted_education,
            "certifications": formatted_certs,
            "profile_version": profile.current_version
        }

        # Calculate ATS Score & Feedback
        ats_analysis = ATSResumeEngine.analyze_ats_compatibility(resume_payload, role)

        return {
            "resume_data": resume_payload,
            "ats_score": ats_analysis["ats_score"],
            "ats_feedback": ats_analysis
        }

    @staticmethod
    def _enhance_project_bullets(description: str, outcomes: str) -> List[str]:
        bullets = []
        if description:
            sentences = [s.strip() for s in description.split(".") if len(s.strip()) > 10]
            for s in sentences[:3]:
                # ensure starts with action verb
                bullets.append(s)
        if outcomes:
            bullets.append(f"Result & Impact: {outcomes}")
        if not bullets:
            bullets.append("Engineered scalable components and integrated database schema for optimum throughput.")
        return bullets

    @staticmethod
    def _enhance_internship_bullets(description: str, achievements: str) -> List[str]:
        bullets = []
        if description:
            sentences = [s.strip() for s in description.split(".") if len(s.strip()) > 10]
            bullets.extend(sentences[:2])
        if achievements:
            bullets.append(f"Key Milestone: {achievements}")
        return bullets

    @staticmethod
    def analyze_ats_compatibility(resume_data: Dict[str, Any], target_role: str, target_jd_text: Optional[str] = None) -> Dict[str, Any]:
        """ATS Analysis Module evaluating keyword coverage, section completeness, and formatting checks."""
        score = 0
        checks = []
        missing_skills = []

        # 1. Section Completeness (40 points)
        sections = {
            "Contact Info": bool(resume_data.get("personal_info", {}).get("email") and resume_data.get("personal_info", {}).get("phone")),
            "Professional Summary": bool(resume_data.get("summary") and len(resume_data["summary"]) > 40),
            "Technical Skills": bool(resume_data.get("technical_skills") and len(resume_data["technical_skills"]) >= 4),
            "Projects": bool(resume_data.get("projects") and len(resume_data["projects"]) >= 1),
            "Education": bool(resume_data.get("education") and len(resume_data["education"]) >= 1),
            "Internships/Experience": bool(resume_data.get("internships") and len(resume_data["internships"]) >= 1)
        }

        for sec, passed in sections.items():
            if passed:
                score += 7
                checks.append({"item": f"Section '{sec}' is well-structured and complete", "status": "pass"})
            else:
                checks.append({"item": f"Section '{sec}' is missing or sparse", "status": "warning"})

        # 2. Role Keyword Coverage (35 points)
        expected_role_keywords = {
            "AI/ML Engineer": ["python", "machine learning", "deep learning", "sql", "data", "model", "pipeline", "docker"],
            "Full-Stack Software Developer": ["javascript", "react", "api", "sql", "git", "database", "html", "css", "docker"],
            "Data Analyst": ["sql", "excel", "python", "tableau", "statistics", "data cleaning", "reporting"],
            "Cloud & DevOps Engineer": ["linux", "docker", "kubernetes", "aws", "ci/cd", "bash", "terraform"]
        }

        keywords = expected_role_keywords.get(target_role, ["programming", "database", "problem solving", "git", "api"])
        all_text = json.dumps(resume_data).lower()

        found_count = 0
        for kw in keywords:
            if kw in all_text:
                found_count += 1
            else:
                missing_skills.append(kw.title())

        kw_score = int((found_count / len(keywords)) * 35) if keywords else 30
        score += kw_score

        # 3. Action Verb & Quantifiable Metrics Check (25 points)
        action_verbs = ["built", "engineered", "designed", "optimized", "implemented", "developed", "achieved", "reduced", "delivered", "deployed"]
        verb_count = sum(1 for v in action_verbs if v in all_text)
        if verb_count >= 4:
            score += 15
            checks.append({"item": f"Strong action verb density ({verb_count}+ high-impact verbs detected)", "status": "pass"})
        else:
            score += 8
            checks.append({"item": "Consider adding more quantifiable action verbs (e.g., 'Engineered', 'Optimized', 'Scaled')", "status": "warning"})

        # Numbers / Metrics check (e.g., %, ms, hours, users)
        metrics_found = bool(re.search(r'(\d+%\s*|\d+\+?\s*(users|hours|ms|latency|records))', all_text))
        if metrics_found:
            score += 10
            checks.append({"item": "Quantifiable metrics and measurable outcomes identified", "status": "pass"})
        else:
            score += 5
            checks.append({"item": "Add measurable metrics (e.g., 'reduced latency by 30%', 'served 1000+ users')", "status": "tip"})

        final_ats_score = min(98, max(45, score))

        return {
            "ats_score": final_ats_score,
            "keyword_match_percentage": int((found_count / len(keywords)) * 100) if keywords else 80,
            "found_keywords_count": found_count,
            "missing_keywords": missing_skills,
            "checks": checks,
            "disclaimer": "ATS compatibility score is indicative based on standard parsing heuristic frameworks and does not guarantee employer hiring outcomes."
        }

ats_resume_engine = ATSResumeEngine()

