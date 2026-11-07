import pytest
from app.services.ats_resume_engine import ats_resume_engine
from app.services.doc_export_service import doc_export_service

def test_ats_analysis():
    sample_resume = {
        "personal_info": {"full_name": "Test Student", "email": "test@test.com", "phone": "1234567890"},
        "summary": "Experienced software developer proficient in Python, SQL, REST APIs, and Docker.",
        "technical_skills": ["Python", "SQL", "Docker", "Git", "FastAPI"],
        "projects": [{"title": "Web App", "role": "Dev", "bullets": ["Built scalable API serving 1000+ users"]}],
        "education": [{"degree": "B.Tech", "institution": "NIT"}],
        "internships": [{"company": "Tech Corp", "position": "Intern", "bullets": ["Engineered backend microservices"]}]
    }

    ats = ats_resume_engine.analyze_ats_compatibility(sample_resume, "Full-Stack Software Developer")
    assert ats["ats_score"] >= 70
    assert "keyword_match_percentage" in ats
    assert len(ats["checks"]) >= 6

def test_pdf_generation():
    sample_resume = {
        "personal_info": {"full_name": "Alex Sharma", "email": "alex@example.com", "phone": "+91 9876543210", "headline": "Software Engineer"},
        "summary": "Results-driven engineering graduate with hands-on proficiency in Python and FastAPI.",
        "technical_skills": ["Python", "FastAPI", "SQL", "Docker"],
        "projects": [{"title": "Analytics Engine", "role": "Lead", "bullets": ["Engineered REST pipeline"]}],
        "education": [{"degree": "B.Tech", "department": "CSE", "institution": "NIT", "graduation_year": 2026}],
        "internships": []
    }

    pdf_bytes = doc_export_service.generate_resume_pdf(sample_resume)
    assert len(pdf_bytes) > 500
    assert pdf_bytes.startswith(b"%PDF")

def test_docx_generation():
    sample_resume = {
        "personal_info": {"full_name": "Alex Sharma", "email": "alex@example.com", "phone": "+91 9876543210"},
        "summary": "Results-driven engineering graduate.",
        "technical_skills": ["Python", "FastAPI"],
        "projects": [],
        "education": []
    }

    docx_bytes = doc_export_service.generate_resume_docx(sample_resume)
    assert len(docx_bytes) > 500
    assert docx_bytes.startswith(b"PK")  # ZIP-based DOCX header

