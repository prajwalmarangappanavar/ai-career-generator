# CareerPulse AI - Personalized Career Content Generator
### An Intelligent AI-Powered Career Guidance & Professional Development Platform

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10%20%7C%203.11%20%7C%203.12%20%7C%203.14-blue.svg)](https://www.python.org/)
[![Database](https://img.shields.io/badge/Database-SQLAlchemy%20%7C%20SQLite%20%7C%20PostgreSQL-orange.svg)](https://www.sqlalchemy.org/)
[![Tests](https://img.shields.io/badge/Tests-Pytest%20Passing-brightgreen.svg)](https://pytest.org/)
[![UI/UX](https://img.shields.io/badge/Frontend-TailwindCSS%20%7C%20Chart.js-purple.svg)](https://tailwindcss.com/)

---

## 🌟 Executive Summary

**CareerPulse AI** is a complete, production-grade, AI-powered web platform designed to solve the critical challenges final-year and engineering college students face during campus placements, internship searches, and early-career professional development.

Unlike surface-level chatbot wrappers or static templates, **CareerPulse AI** implements a **Centralized Career Profile as a Single Source of Truth (SSOT)**. Every generated professional asset—from ATS resumes and tailored cover letters to 90-day learning roadmaps, skill-gap radar analyses, and interactive voice mock interviews—is mathematically and semantically validated against verified student facts. **The platform strictly guarantees zero hallucinated degrees, fabricated internships, or false qualifications.**

---

## 🏛️ System Architecture

```text
                                Student Facts
                       (Academics, Skills, Projects, Experience)
                                      ↓
                ┌───────────────────────────────────────────────┐
                │    Centralized Student Profile (SSOT)         │
                │    • Pydantic Schema Validation               │
                │    • Immutable Snapshot Versioning (v1, v2...)│
                └───────────────────────┬───────────────────────┘
                                        │
                         Consistency & Anti-Fabrication Engine
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ↓                            ↓                            ↓
  ┌──────────────────┐        ┌──────────────────┐        ┌──────────────────┐
  │ AI Content Engine│        │  Skill-Gap Engine│        │ Interview System │
  │ • Resume Summary │        │ • Framework Match│        │ • Technical DSA  │
  │ • LinkedIn About │        │ • Multi-Axis Radar│       │ • Behavioral STAR│
  │ • Branding Pitch │        │ • Curated Roadmaps│       │ • Voice Mock Q&A │
  │ • Role Fit Score │        │ • Verified Links │        │ • Live Scoring   │
  └────────┬─────────┘        └────────┬─────────┘        └────────┬─────────┘
           │                           │                           │
           └───────────────────────────┼───────────────────────────┘
                                       ↓
                        Binary Document Export Center
                        • ReportLab Native PDF Generator
                        • python-docx Word (.docx) Engine
```

---

## 🚀 Key Functional Modules

| Module | Features & Capabilities |
| :--- | :--- |
| **1. Centralized Career Profile (SSOT)** | Single source of truth with immutable version tracking (`profile_versions`), automatic completion score calculation, and anti-fabrication validators. |
| **2. AI Career Profile Generator** | Generates professional introductions, ATS resume summaries, career objectives, LinkedIn About narratives, and elevator branding pitches across fresher, internship, entry-level, and research profiles. |
| **3. Intelligent Skill-Gap Analyzer** | Evaluates student skills against standardized role frameworks (AI/ML Engineer, Full-Stack Developer, Data Analyst, Cloud DevOps, Cybersecurity, UI/UX Designer) with interactive Chart.js Radar visualization, proficiency delta bars, and priority learning sequencing. |
| **4. 30/60/90-Day & 1-Year Career Roadmaps** | Week-by-week actionable curricula with interactive task checkoffs, personal notes, milestone badges, and direct links to verified resources (Coursera, MIT OCW, Harvard CS50, freeCodeCamp, official docs). |
| **5. AI Resume Builder & ATS Scanner** | Modern, Professional, Minimalist, and Creative templates; live side-by-side editing; ATS compatibility scoring gauge (0-100); keyword density analyzer; and 1-click downloads in PDF and Word DOCX formats. |
| **6. AI Cover Letter Generator** | Company-specific and role-tailored application letters emphasizing completed student projects and coursework without fabricating experience. |
| **7. Interactive Voice & AI Mock Interviewer** | Turn-by-turn interactive placement interviewer with Web Speech API Speech-to-Text (microphone input) and Text-to-Speech audio response. Real-time rubric evaluation on Relevance, Technical Depth, Clarity, Communication, and STAR structure (1-10 each). |
| **8. Job Description Semantic Matcher** | Paste any employer job description to extract required keywords, view transparent match indicators, identify missing skills, and instantly generate aligned resume summaries and cover letters. |
| **9. Portfolio Project Recommendation Engine** | Recommends beginner, intermediate, and advanced practical project briefs with problem statements, learning objectives, and 1-click **"Add to My Profile"** button. |
| **10. AI Career Counselor Chatbot** | Context-aware career assistant grounded in the student's profile context with suggested prompt pills and markdown rendering. |
| **11. Administrator Governance Portal** | User management (activate/deactivate student accounts), platform statistics, career role management, and system health monitoring. |

---

## 🛠️ Technology Stack

- **Backend**: Python 3.10+, FastAPI, Uvicorn, Pydantic v2
- **Database**: SQLAlchemy 2.0 ORM with SQLite (out-of-the-box local setup) and PostgreSQL compatibility
- **Document Processing**: ReportLab 5.1 (PDF Generation), python-docx 1.2 (Word DOCX export), PyPDF2 (PDF extraction)
- **AI & NLP**: Google Gemini 1.5/2.0 API integration, OpenAI-compatible client, and deterministic heuristic fallback engine
- **Frontend**: Responsive Single-Page Application (SPA) using HTML5, Tailwind CSS, Lucide-style SVG icons, and Chart.js 4.4
- **Testing**: Pytest & Pytest-Asyncio with 100% passing test suite

---

## ⚡ Quick Start & Setup Instructions

### 1. Prerequisites
- Python 3.10, 3.11, 3.12, or 3.14 installed on your machine.
- Git (optional, for cloning).

### 2. Clone or Navigate to Project
```bash
cd agentic
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Optional)* Add your `GEMINI_API_KEY` or `OPENAI_API_KEY` in `.env` if you want to use cloud LLM inference. If left empty, CareerPulse AI automatically runs its high-fidelity, deterministic local AI engine!

### 5. Start the Application
```bash
python run.py
```
Open your browser and navigate to:
👉 **`http://127.0.0.1:8000`**

### 6. Interactive Swagger API Documentation
👉 **`http://127.0.0.1:8000/docs`**

---

## 🔑 Default Demo Credentials

The database is pre-seeded with realistic student and administrator profiles for instant evaluation:

| User Role | Email | Password | Pre-Loaded Profile Data |
| :--- | :--- | :--- | :--- |
| **Student** | `student@example.com` | `StudentPassword123!` | Alex Sharma, B.Tech CSE (NIT), 8.85 CGPA, Python/ML/React skills, 2 full-stack projects, software intern experience. |
| **Admin** | `admin@careerpulse.ai` | `AdminSecurePassword123!` | System Administrator with full user management, platform analytics, and role controls. |

*You can also click the **"1-Click Demo Student Experience"** button on the landing page or login modal to enter immediately!*

---

## 🧪 Running Automated Tests

Run the full automated test suite covering authentication, anti-fabrication checks, ATS scoring, document generation, and skill-gap calculations:
```bash
python -m pytest -v
```

Expected output:
```text
backend/tests/test_api_integration.py::test_login_and_roles_direct PASSED
backend/tests/test_auth.py::test_password_hashing PASSED
backend/tests/test_auth.py::test_jwt_token_generation_and_decoding PASSED
backend/tests/test_consistency.py::test_profile_completion_calculation PASSED
backend/tests/test_consistency.py::test_anti_fabrication_validator PASSED
backend/tests/test_resume_ats.py::test_ats_analysis PASSED
backend/tests/test_resume_ats.py::test_pdf_generation PASSED
backend/tests/test_resume_ats.py::test_docx_generation PASSED
backend/tests/test_skill_gap.py::test_skill_gap_analysis PASSED

9 passed in 1.00s
```

---

## 🗄️ Relational Database Schema (27 Tables)

1. `users`: Authentication records, email, secure PBKDF2 hash, roles (student/admin).
2. `student_profiles`: Centralized profile details, bio, completion percentage, readiness score, current version.
3. `education`: Degree, institution, department, graduation year, CGPA, relevant coursework.
4. `skills`: Student skill records, category, self-reported proficiency (1-5), verified status.
5. `interests`: Career interests and technical focus areas.
6. `career_goals`: Target role, preferred industry, short/long-term objectives, learning style.
7. `projects`: Technical projects, problem statements, technologies, role, measurable outcomes.
8. `certifications`: Industry certifications, issuing organization, dates, credential verification links.
9. `internships`: Work experiences, company, role, dates, achievements.
10. `career_roles`: Standardized roles (AI/ML Engineer, Full-Stack Dev, Data Analyst, etc.).
11. `career_role_skills`: Structured role requirements, required proficiency, priority level (essential/important).
12. `skill_assessments`: Multiple-choice quiz questions with explanations for knowledge verification.
13. `skill_gap_reports`: Historical skill gap analysis records and compatibility scores.
14. `learning_resources`: Curated courses, tutorials, and documentation with verified URLs.
15. `learning_roadmaps`: Multi-day roadmaps (30d, 60d, 90d, 6m, 1y).
16. `roadmap_tasks`: Weekly milestone assignments, checkable status, notes, deadlines.
17. `resumes`: Generated resumes, template style, ATS scores, diagnostic breakdown.
18. `cover_letters`: Company-tailored cover letter drafts and customized tones.
19. `interview_questions`: Question banks across Technical, HR, Behavioral STAR, and Project defense.
20. `mock_interviews`: Mock interview session records, duration, overall placement readiness score.
21. `interview_feedback`: Turn-by-turn rubric evaluations (Relevance, Tech, Clarity, Communication, STAR).
22. `job_descriptions`: Uploaded/pasted employer job description postings.
23. `job_match_reports`: Semantic alignment scores, missing keywords, tailored summaries.
24. `generated_documents`: Export tracking linking generated assets to profile version numbers.
25. `profile_versions`: Immutable snapshots of student profiles for auditability and SSOT consistency.
26. `chatbot_conversations`: Conversational session history for AI placement mentor.
27. `notifications`: Milestone reminders, roadmap alerts, and profile updates.

---

## 🎓 Academic Presentation & Viva Talking Points

When presenting this project for major college final-year evaluations or technical viva:

1. **Why Single Source of Truth (SSOT)?**
   - Standard AI tools hallucinate past jobs, degrees, or years of experience. CareerPulse AI guarantees truthfulness by validating every generated document against an immutable versioned profile snapshot.
2. **How is the ATS Score calculated?**
   - Combines section completeness (contact info, summary, education, experience, projects), role keyword coverage, action-verb density, and quantifiable impact metric detection.
3. **How does the Mock Interview turn-by-turn evaluation work?**
   - Uses Web Speech API for real-time speech recognition (STT) and voice synthesis (TTS), assessing each response across four independent axes (Relevance, Tech Correctness, Clarity, Communication) plus STAR methodology checking.
4. **How are Skill Gaps identified?**
   - Cross-references student self-reported & verified proficiencies against a weighted matrix of Essential, Important, and Nice-to-Have competencies for the target role.

---

## 📄 License
Developed for academic excellence and technical portfolio presentation. Licensed under the MIT License.

