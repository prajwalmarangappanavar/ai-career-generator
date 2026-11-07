import json
import re
from typing import Any, Dict, List
from app.db.models import StudentProfile
from app.services.ai_engine import ai_engine
from app.services.consistency_engine import consistency_engine

class JDAnalyzerEngine:
    """Analyzes employer job descriptions, extracts required skills,

    calculates transparent match scores, and generates tailored content.
    """

    @staticmethod
    async def analyze_jd(job_title: str, company_name: str, jd_text: str, profile: StudentProfile) -> Dict[str, Any]:
        facts = consistency_engine.get_profile_facts(profile)
        student_skills = facts["skills"]
        student_skills_lower = [s.lower() for s in student_skills]

        # Extract technology keywords from JD using regex & curated dictionary
        tech_dictionary = [
            "python", "javascript", "typescript", "react", "node.js", "fastapi", "django",
            "sql", "postgresql", "mysql", "mongodb", "docker", "kubernetes", "aws", "azure", "gcp",
            "git", "linux", "machine learning", "deep learning", "pytorch", "tensorflow",
            "rest api", "graphql", "ci/cd", "pandas", "numpy", "scikit-learn", "redis", "html", "css"
        ]

        extracted_skills = []
        jd_lower = jd_text.lower()
        for tech in tech_dictionary:
            if re.search(rf"\b{re.escape(tech)}\b", jd_lower):
                extracted_skills.append(tech.title())

        # If few extracted, add basic keywords
        if not extracted_skills:
            extracted_skills = ["Python", "SQL", "Git", "Problem Solving", "REST APIs"]

        # Calculate Matches & Gaps
        matched_skills = []
        missing_skills = []
        for s in extracted_skills:
            if any(s.lower() in st or st in s.lower() for st in student_skills_lower):
                matched_skills.append(s)
            else:
                missing_skills.append(s)

        total_req = len(extracted_skills)
        match_score = int((len(matched_skills) / total_req) * 100) if total_req > 0 else 70
        match_score = max(25, min(95, match_score))

        # Tailored Summary & Cover Letter
        name = facts["full_name"]
        degree = facts["degrees"][0] if facts["degrees"] else "Computer Science"
        institution = facts["institutions"][0] if facts["institutions"] else "University"
        top_matched = ", ".join(matched_skills[:4]) if matched_skills else ", ".join(student_skills[:3])

        tailored_summary = (
            f"Dedicated {degree} candidate from {institution} with hands-on proficiency in {top_matched}. "
            f"Experienced in developing resilient software architectures and eager to contribute to {company_name}'s "
            f"engineering initiatives as a {job_title}."
        )

        tailored_cover_letter = (
            f"Dear Hiring Team at {company_name},\n\n"
            f"I am writing to express my strong enthusiasm for the {job_title} position. "
            f"As a {degree} student graduating from {institution}, I have developed deep foundational and practical experience in {top_matched}.\n\n"
            f"My academic and practical background aligns well with the technical challenges outlined in your job description. "
            f"In my past projects, I have engineered scalable solutions, prioritized clean code architecture, and consistently delivered reliable software.\n\n"
            f"I would welcome the opportunity to discuss how my technical skills and enthusiasm for innovation can contribute to {company_name}'s continued growth.\n\n"
            f"Sincerely,\n{name}"
        )

        recommended_projects = [
            {
                "title": f"{job_title} Capstone Architecture",
                "description": f"Build an end-to-end full stack system incorporating {', '.join(missing_skills[:2]) if missing_skills else 'production monitoring and scaling'}.",
                "skills_covered": missing_skills[:2] if missing_skills else ["System Design", "Cloud Deployment"]
            }
        ]

        interview_questions = [
            f"How would you apply your experience in {top_matched.split(',')[0]} to optimize performance in this {job_title} position?",
            f"Can you explain how you would quickly master {missing_skills[0] if missing_skills else 'distributed microservices'} in a fast-paced team?",
            f"Walk us through a technical challenge you encountered when implementing a core feature and how you resolved it."
        ]

        return {
            "job_title": job_title,
            "company_name": company_name,
            "match_score": match_score,
            "matching_skills": matched_skills,
            "missing_skills": missing_skills,
            "tailored_summary": tailored_summary,
            "tailored_cover_letter": tailored_cover_letter,
            "recommended_projects": recommended_projects,
            "interview_questions": interview_questions,
            "disclaimer": "The Job Match Score is indicative based on keyword and semantic profile alignment. It does not represent an automated hiring screening decision."
        }

jd_analyzer_engine = JDAnalyzerEngine()

