import json
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.security import hash_password
from app.db.models import (
    CareerRole,
    CareerRoleSkill,
    Education,
    Interest,
    Internship,
    LearningResource,
    Notification,
    Project,
    Skill,
    SkillAssessment,
    StudentProfile,
    User,
    CareerGoal,
    Certification,
    InterviewQuestion,
    ProfileVersion
)

def seed_database(db: Session):
    """Seed the database with initial career roles, skills, learning resources, and default admin/demo student."""

    # 1. Admin User
    admin = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
    if not admin:
        admin = User(
            email=settings.ADMIN_EMAIL,
            password_hash=hash_password(settings.ADMIN_PASSWORD),
            full_name="System Administrator",
            role="admin",
            is_active=True
        )
        db.add(admin)
        db.flush()

    # 2. Demo Student User
    demo_email = "student@example.com"
    demo_student = db.query(User).filter(User.email == demo_email).first()
    if not demo_student:
        demo_student = User(
            email=demo_email,
            password_hash=hash_password("StudentPassword123!"),
            full_name="Alex Sharma",
            role="student",
            is_active=True
        )
        db.add(demo_student)
        db.flush()

        profile = StudentProfile(
            user_id=demo_student.id,
            headline="Aspiring AI Engineer & Full-Stack Developer | Final Year CS Student",
            phone="+91 98765 43210",
            location="Bengaluru, Karnataka, India",
            bio="Motivated final-year Computer Science undergraduate with hands-on experience in Python, Machine Learning, and modern web application development. Passionate about solving real-world challenges through data-driven intelligent systems.",
            completion_percentage=85,
            career_readiness_score=78,
            current_version=1
        )
        db.add(profile)
        db.flush()

        # Education
        edu = Education(
            profile_id=profile.id,
            institution="National Institute of Technology (NIT)",
            degree="Bachelor of Technology (B.Tech)",
            department="Computer Science & Engineering",
            graduation_year=2026,
            cgpa="8.85 / 10.0",
            relevant_courses="Data Structures & Algorithms, Machine Learning, Database Management Systems, Computer Networks, Operating Systems, Artificial Intelligence"
        )
        db.add(edu)

        # Career Goal
        goal = CareerGoal(
            profile_id=profile.id,
            target_role="AI/ML Engineer",
            preferred_industry="Artificial Intelligence & Cloud Computing",
            short_term_goals="Secure an entry-level AI Engineer role at a top-tier tech organization, deploy scalable neural network architectures.",
            long_term_goals="Lead an applied research and ML engineering team building production multimodal foundation models.",
            preferred_learning_style="Hands-on Project & Practical Code Labs"
        )
        db.add(goal)

        # Skills
        student_skills = [
            ("Python", "technical", 4, 3.0),
            ("Machine Learning", "technical", 3, 2.0),
            ("FastAPI", "framework", 4, 2.0),
            ("React.js", "framework", 3, 1.5),
            ("SQL", "database", 4, 2.5),
            ("Git & GitHub", "tool", 4, 3.0),
            ("Docker", "tool", 2, 1.0),
            ("Problem Solving", "soft", 4, 4.0),
            ("Team Collaboration", "soft", 5, 3.0),
            ("Technical Communication", "soft", 4, 3.0),
        ]
        for name, cat, prof, exp in student_skills:
            db.add(Skill(
                profile_id=profile.id,
                name=name,
                category=cat,
                proficiency=prof,
                years_experience=exp,
                is_verified=True
            ))

        # Projects
        db.add(Project(
            profile_id=profile.id,
            title="Predictive Healthcare Analytics Engine",
            description="Built an end-to-end predictive machine learning model pipeline to analyze patient vitals and forecast readmission risk with 92% ROC-AUC. Deployed as a microservice using FastAPI and Docker with an interactive React dashboard.",
            technologies="Python, Scikit-Learn, FastAPI, React, Docker, PostgreSQL",
            role="Lead ML Engineer & Full-Stack Architect",
            problem_statement="Hospitals lacked early identification of high-risk readmissions, causing higher costs and suboptimal care.",
            outcomes="Achieved 92% ROC-AUC, cut model inference latency by 45% using ONNX runtime.",
            project_url="https://health-analytics-demo.io",
            github_url="https://github.com/alexsharma/health-analytics"
        ))

        db.add(Project(
            profile_id=profile.id,
            title="Intelligent Campus Placement Portal",
            description="Engineered a centralized placement management portal serving 1,200+ students and 45 corporate recruiters with automated resume parsing, eligibility matching, and interview scheduling.",
            technologies="React, Node.js, Express, PostgreSQL, Tailwind CSS",
            role="Full-Stack Developer",
            problem_statement="Placement office relied on fragmented spreadsheets and manual email communications.",
            outcomes="Eliminated 80+ hours of manual data collation; handled 5,000+ test applications seamlessly.",
            project_url="https://campus-placement-portal.edu",
            github_url="https://github.com/alexsharma/campus-placement"
        ))

        # Internship
        db.add(Internship(
            profile_id=profile.id,
            company="TechNova Solutions Inc.",
            position="Software Development Engineering Intern",
            start_date="June 2025",
            end_date="August 2025",
            is_current=False,
            description="Collaborated with the Core Platform Engineering team to build REST APIs, optimize database queries, and integrate automated testing suites.",
            skills_applied="Python, FastAPI, PostgreSQL, Pytest, Docker, CI/CD",
            achievements="Refactored database query layer reducing p99 latency by 32%; authored 65+ unit and integration tests achieving 94% coverage."
        ))

        # Certification
        db.add(Certification(
            profile_id=profile.id,
            name="Deep Learning Specialization",
            issuing_org="DeepLearning.AI / Coursera",
            issue_date="April 2025",
            credential_url="https://coursera.org/verify/specialization/DL2025XYZ",
            credential_id="DL-2025-99882"
        ))

        # Notification
        db.add(Notification(
            user_id=demo_student.id,
            title="Welcome to CareerPulse AI!",
            message="Your centralized profile is initialized. Check your Skill-Gap Report and explore your tailored 90-day learning roadmap.",
            type="profile"
        ))

        # Profile Snapshot Version 1
        snapshot = {
            "full_name": demo_student.full_name,
            "headline": profile.headline,
            "education": [{"institution": edu.institution, "degree": edu.degree, "cgpa": edu.cgpa, "grad_year": edu.graduation_year}],
            "skills": [{"name": s[0], "proficiency": s[2], "category": s[1]} for s in student_skills],
            "target_role": "AI/ML Engineer"
        }
        db.add(ProfileVersion(
            profile_id=profile.id,
            version_number=1,
            snapshot_json=json.dumps(snapshot),
            change_summary="Initial verified student profile setup"
        ))

    # 3. Career Roles & Skill Frameworks
    roles_data = [
        {
            "title": "AI/ML Engineer",
            "category": "Artificial Intelligence & Data",
            "description": "Designs, builds, trains, and deploys machine learning and deep learning models into production systems with high reliability and efficiency.",
            "average_salary": "$110,000 - $165,000 / ₹12 - ₹28 LPA",
            "market_demand": "Extremely High",
            "growth_rate": "+36% over next 5 years",
            "required_education": "Bachelor's / Master's in Computer Science, Data Science, or Mathematics",
            "skills": [
                ("Python", "technical", 5, "essential"),
                ("Mathematics and statistics", "technical", 4, "essential"),
                ("Machine learning", "technical", 5, "essential"),
                ("Deep learning", "technical", 4, "essential"),
                ("Data preprocessing", "technical", 4, "essential"),
                ("SQL", "database", 4, "essential"),
                ("Model evaluation", "technical", 4, "essential"),
                ("PyTorch / TensorFlow", "framework", 4, "important"),
                ("Docker & Containerization", "tool", 3, "important"),
                ("MLOps & Model Deployment", "technical", 3, "important"),
                ("Problem-solving", "soft", 5, "essential"),
                ("Critical thinking", "soft", 4, "important"),
            ]
        },
        {
            "title": "Full-Stack Software Developer",
            "category": "Software Engineering",
            "description": "Architects and implements end-to-end web applications covering user interfaces, server-side APIs, database modeling, and cloud deployments.",
            "average_salary": "$95,000 - $140,000 / ₹9 - ₹22 LPA",
            "market_demand": "High",
            "growth_rate": "+25% over next 5 years",
            "required_education": "Bachelor's in Computer Science, Software Engineering, or equivalent practical experience",
            "skills": [
                ("JavaScript / TypeScript", "technical", 5, "essential"),
                ("React.js / Next.js", "framework", 4, "essential"),
                ("Node.js / Python / Go", "technical", 4, "essential"),
                ("REST APIs & GraphQL", "technical", 4, "essential"),
                ("SQL (PostgreSQL/MySQL)", "database", 4, "essential"),
                ("HTML5 & Modern CSS / Tailwind", "technical", 4, "essential"),
                ("Git & Version Control", "tool", 4, "essential"),
                ("System Architecture", "technical", 3, "important"),
                ("Docker", "tool", 3, "important"),
                ("CI/CD Pipelines", "tool", 3, "nice_to_have"),
                ("Teamwork & Agile", "soft", 4, "essential"),
                ("Communication", "soft", 4, "essential"),
            ]
        },
        {
            "title": "Data Analyst",
            "category": "Data & Business Intelligence",
            "description": "Transforms raw transactional and business data into actionable strategic insights through statistical modeling, dashboards, and reports.",
            "average_salary": "$75,000 - $110,000 / ₹7 - ₹16 LPA",
            "market_demand": "High",
            "growth_rate": "+28% over next 5 years",
            "required_education": "Bachelor's in Statistics, Computer Science, Economics, or Business Analytics",
            "skills": [
                ("SQL", "database", 5, "essential"),
                ("Excel & Advanced Spreadsheets", "tool", 5, "essential"),
                ("Python (Pandas, NumPy)", "technical", 4, "essential"),
                ("Tableau / Power BI", "tool", 4, "essential"),
                ("Statistical Analysis", "technical", 4, "essential"),
                ("Data Cleaning & Wrangling", "technical", 4, "essential"),
                ("Data Storytelling", "soft", 4, "important"),
                ("Business Acumen", "soft", 4, "important"),
                ("Critical thinking", "soft", 5, "essential"),
            ]
        },
        {
            "title": "Cloud & DevOps Engineer",
            "category": "Infrastructure & Cloud",
            "description": "Automates cloud infrastructure deployment, manages scalable Kubernetes clusters, configures continuous delivery pipelines, and ensures 99.99% uptime.",
            "average_salary": "$105,000 - $155,000 / ₹11 - ₹26 LPA",
            "market_demand": "Very High",
            "growth_rate": "+30% over next 5 years",
            "required_education": "Bachelor's in Computer Science, IT, or equivalent certification track",
            "skills": [
                ("Linux Administration", "technical", 5, "essential"),
                ("Docker & Containerization", "tool", 5, "essential"),
                ("Kubernetes", "tool", 4, "essential"),
                ("AWS / Azure / GCP", "technical", 4, "essential"),
                ("Terraform & Infrastructure as Code", "tool", 4, "essential"),
                ("CI/CD (GitHub Actions / GitLab)", "tool", 4, "essential"),
                ("Bash & Python Scripting", "technical", 4, "essential"),
                ("Cloud Security & IAM", "technical", 3, "important"),
                ("Monitoring & Observability (Prometheus/Grafana)", "tool", 3, "important"),
            ]
        },
        {
            "title": "Cybersecurity Analyst",
            "category": "Security & Risk",
            "description": "Safeguards information assets, monitors threat intelligence, analyzes vulnerabilities, performs intrusion detection, and hardens enterprise defenses.",
            "average_salary": "$90,000 - $135,000 / ₹9 - ₹20 LPA",
            "market_demand": "High",
            "growth_rate": "+33% over next 5 years",
            "required_education": "Bachelor's in Cybersecurity, Computer Networks, or Information Systems",
            "skills": [
                ("Network Protocols (TCP/IP, DNS, SSL/TLS)", "technical", 5, "essential"),
                ("Vulnerability Assessment", "technical", 4, "essential"),
                ("SIEM Tools (Splunk, Wireshark)", "tool", 4, "essential"),
                ("Linux & Windows OS Security", "technical", 4, "essential"),
                ("Python / Bash Scripting", "technical", 3, "important"),
                ("Incident Response & Forensics", "technical", 4, "essential"),
                ("Ethical Hacking & Penetration Testing", "technical", 3, "important"),
                ("Attention to Detail", "soft", 5, "essential"),
            ]
        },
        {
            "title": "UI/UX Product Designer",
            "category": "Design & User Experience",
            "description": "Conducts user research, designs wireframes and interactive prototypes, and crafts accessible, delight-driven design systems.",
            "average_salary": "$80,000 - $120,000 / ₹7 - ₹18 LPA",
            "market_demand": "High",
            "growth_rate": "+20% over next 5 years",
            "required_education": "Bachelor's in Human-Computer Interaction, Design, or Computer Science",
            "skills": [
                ("Figma & Design Systems", "tool", 5, "essential"),
                ("Wireframing & Prototyping", "technical", 5, "essential"),
                ("User Research & Usability Testing", "technical", 4, "essential"),
                ("Information Architecture", "technical", 4, "essential"),
                ("HTML/CSS Fundamentals", "technical", 3, "important"),
                ("Design Thinking", "soft", 5, "essential"),
                ("Empathy & Active Listening", "soft", 5, "essential"),
            ]
        }
    ]

    for role_item in roles_data:
        existing_role = db.query(CareerRole).filter(CareerRole.title == role_item["title"]).first()
        if not existing_role:
            role = CareerRole(
                title=role_item["title"],
                category=role_item["category"],
                description=role_item["description"],
                average_salary=role_item["average_salary"],
                market_demand=role_item["market_demand"],
                growth_rate=role_item["growth_rate"],
                required_education=role_item["required_education"]
            )
            db.add(role)
            db.flush()

            for s_name, s_cat, s_req, s_prio in role_item["skills"]:
                db.add(CareerRoleSkill(
                    career_role_id=role.id,
                    skill_name=s_name,
                    category=s_cat,
                    required_proficiency=s_req,
                    priority_level=s_prio
                ))

    # 4. Curated Learning Resources with Verified Links
    resources_data = [
        {
            "title": "CS50's Introduction to Computer Science",
            "provider": "Harvard University / edX",
            "resource_type": "course",
            "url": "https://cs50.harvard.edu/x",
            "difficulty": "Beginner",
            "duration_hours": 60.0,
            "skills": ["C", "Python", "SQL", "Data Structures", "Algorithms"],
            "rating": 4.9
        },
        {
            "title": "Python for Everybody Specialization",
            "provider": "University of Michigan / Coursera",
            "resource_type": "course",
            "url": "https://www.coursera.org/specializations/python",
            "difficulty": "Beginner",
            "duration_hours": 40.0,
            "skills": ["Python", "SQL", "Data Structures", "Web Scraping"],
            "rating": 4.8
        },
        {
            "title": "Official Python 3 Documentation & Tutorial",
            "provider": "Python Software Foundation",
            "resource_type": "documentation",
            "url": "https://docs.python.org/3/tutorial/",
            "difficulty": "Beginner",
            "duration_hours": 15.0,
            "skills": ["Python", "Object-Oriented Programming"],
            "rating": 4.9
        },
        {
            "title": "Machine Learning Specialization",
            "provider": "Andrew Ng / DeepLearning.AI & Stanford",
            "resource_type": "course",
            "url": "https://www.coursera.org/specializations/machine-learning-introduction",
            "difficulty": "Intermediate",
            "duration_hours": 75.0,
            "skills": ["Machine learning", "Python", "Mathematics and statistics", "Model evaluation"],
            "rating": 4.95
        },
        {
            "title": "Scikit-Learn Machine Learning in Python Docs",
            "provider": "Scikit-Learn Developers",
            "resource_type": "documentation",
            "url": "https://scikit-learn.org/stable/user_guide.html",
            "difficulty": "Intermediate",
            "duration_hours": 25.0,
            "skills": ["Machine learning", "Data preprocessing", "Model evaluation"],
            "rating": 4.85
        },
        {
            "title": "Full Stack Open: Deep Dive into Modern Web Development",
            "provider": "University of Helsinki",
            "resource_type": "course",
            "url": "https://fullstackopen.com/en/",
            "difficulty": "Intermediate",
            "duration_hours": 80.0,
            "skills": ["React.js", "Node.js", "REST APIs", "TypeScript", "SQL"],
            "rating": 4.9
        },
        {
            "title": "React Official Documentation & Interactive Guide",
            "provider": "React Core Team",
            "resource_type": "documentation",
            "url": "https://react.dev",
            "difficulty": "Beginner",
            "duration_hours": 20.0,
            "skills": ["React.js / Next.js", "JavaScript / TypeScript"],
            "rating": 4.9
        },
        {
            "title": "FastAPI Web Framework Official Tutorial",
            "provider": "Tiangolo / FastAPI",
            "resource_type": "documentation",
            "url": "https://fastapi.tiangolo.com/tutorial/",
            "difficulty": "Intermediate",
            "duration_hours": 18.0,
            "skills": ["Python", "REST APIs", "AsyncIO"],
            "rating": 4.9
        },
        {
            "title": "SQL Murder Mystery: Interactive Database Practice",
            "provider": "Knight Lab / Northwestern University",
            "resource_type": "tutorial",
            "url": "https://mystery.knightlab.com/",
            "difficulty": "Beginner",
            "duration_hours": 4.0,
            "skills": ["SQL", "Data preprocessing"],
            "rating": 4.9
        },
        {
            "title": "Docker for Beginners: Hands-On Containerization",
            "provider": "freeCodeCamp / YouTube",
            "resource_type": "youtube",
            "url": "https://www.youtube.com/watch?v=fqMOX6JJhGo",
            "difficulty": "Beginner",
            "duration_hours": 3.0,
            "skills": ["Docker & Containerization", "Linux Administration"],
            "rating": 4.8
        },
        {
            "title": "NeetCode 150: Essential Algorithms & Data Structures",
            "provider": "NeetCode.io",
            "resource_type": "tutorial",
            "url": "https://neetcode.io/practice",
            "difficulty": "Intermediate",
            "duration_hours": 50.0,
            "skills": ["Problem-solving", "Data Structures", "Algorithms"],
            "rating": 4.95
        },
        {
            "title": "MIT OpenCourseWare: Introduction to Deep Learning (6.S191)",
            "provider": "MIT OpenCourseWare",
            "resource_type": "course",
            "url": "http://introtodeeplearning.com/",
            "difficulty": "Advanced",
            "duration_hours": 30.0,
            "skills": ["Deep learning", "PyTorch / TensorFlow", "Mathematics and statistics"],
            "rating": 4.9
        }
    ]

    for res in resources_data:
        existing_res = db.query(LearningResource).filter(LearningResource.title == res["title"]).first()
        if not existing_res:
            db.add(LearningResource(
                title=res["title"],
                provider=res["provider"],
                resource_type=res["resource_type"],
                url=res["url"],
                difficulty=res["difficulty"],
                duration_hours=res["duration_hours"],
                skills_covered_json=json.dumps(res["skills"]),
                rating=res["rating"],
                is_verified=True
            ))

    # 5. Interview Questions Bank
    interview_q_data = [
        # Technical
        {
            "category": "technical",
            "target_role": "AI/ML Engineer",
            "question": "Can you explain the difference between L1 and L2 regularization, and when would you choose one over the other?",
            "difficulty": "Intermediate",
            "sample_answer_framework": "1. Define Regularization (preventing overfitting by penalizing large model weights).\n2. Explain L1 (Lasso): Adds absolute sum of coefficients. Causes sparse feature weights (drives coefficients to exactly zero), useful for embedded feature selection.\n3. Explain L2 (Ridge): Adds squared magnitude of coefficients. Shrinks weights smoothly towards zero without eliminating them, ideal when many features contribute small effects and multicollinearity is present.\n4. Real-world example from a model you built.",
            "criteria": ["Understands mathematical formulation", "Explains sparsity vs shrinkage", "Practical context of feature selection"]
        },
        {
            "category": "technical",
            "target_role": "AI/ML Engineer",
            "question": "How do you detect and handle data leakage in a machine learning pipeline?",
            "difficulty": "Advanced",
            "sample_answer_framework": "1. Definition: Information from outside the training dataset being inadvertently used to train the model, inflating evaluation metrics.\n2. Common causes: Preprocessing or scaling before train/test split, time-series future information leaking into past, target-derived variables.\n3. Prevention strategies: Perform all transformations (imputation, scaling, encoding) strictly inside cross-validation pipelines (e.g., scikit-learn Pipeline). For temporal data, use TimeSeriesSplit or chronological splitting.",
            "criteria": ["Identifies preprocessing split mistake", "Explains time-series leakage", "Proposes Pipeline-based isolation"]
        },
        {
            "category": "technical",
            "target_role": "Full-Stack Software Developer",
            "question": "What is the difference between SQL and NoSQL databases, and how do you decide which to use for a new product?",
            "difficulty": "Intermediate",
            "sample_answer_framework": "1. Structural differences: Relational tabular schemas with ACID guarantees vs flexible document/key-value/graph models.\n2. Scalability: Vertical scaling vs horizontal sharding.\n3. Decision criteria: Use SQL when data has complex relationships, strict financial transactions, and structured schemas. Use NoSQL when handling high-volume un-structured data, rapid prototyping, or dynamic polymorphic records.",
            "criteria": ["ACID vs BASE explanation", "Schema rigidity vs flexibility", "Clear tradeoff decision rationale"]
        },
        # Behavioral STAR
        {
            "category": "behavioral",
            "target_role": "General",
            "question": "Describe a situation where a technical project fell behind schedule or faced unexpected roadblocks. How did you handle it?",
            "difficulty": "Intermediate",
            "sample_answer_framework": "Use the STAR Method:\n- Situation: Describe the academic or internship project, deadlines, and team setup.\n- Task: What was your specific responsibility that faced the bottleneck?\n- Action: What concrete technical or communication steps did you take? (e.g., triage, scope reduction, pair programming, automated test refactoring).\n- Result: Quantifiable outcome, delivered milestone, lessons learned.",
            "criteria": ["Clear STAR structure", "Ownership and accountability", "Actionable problem-solving", "Honest retrospection"]
        },
        # HR
        {
            "category": "hr",
            "target_role": "General",
            "question": "Tell me about yourself, your academic background, and why you are interested in this specific career path.",
            "difficulty": "Beginner",
            "sample_answer_framework": "Structure in 3 beats (Past -> Present -> Future):\n1. Present: Current degree, core focus, recent technical projects.\n2. Past: Spark of interest, foundational coursework, hands-on internship or team achievements.\n3. Future: Why this role aligns with your next 2-year learning curve and what value you bring.",
            "criteria": ["Concise (under 2 minutes)", "Relevant technical highlights", "Enthusiasm and genuine career intent"]
        },
        # Project-Based
        {
            "category": "project",
            "target_role": "AI/ML Engineer",
            "question": "Walk me through the architecture of a major project on your resume. What was the biggest architectural tradeoff you made?",
            "difficulty": "Intermediate",
            "sample_answer_framework": "1. Problem & Context: State the problem statement and end users clearly.\n2. High-level architecture: Data ingestion -> model inference -> API layer -> client interface.\n3. Tradeoff discussion: E.g., choosing batch inference over real-time stream due to latency/cost budget, or using a simpler Random Forest instead of a complex Deep Net for explainability and lower memory footprint.",
            "criteria": ["Clear system design explanation", "Articulates real engineering tradeoffs", "Shows depth of personal contribution"]
        }
    ]

    for q in interview_q_data:
        existing_q = db.query(InterviewQuestion).filter(InterviewQuestion.question == q["question"]).first()
        if not existing_q:
            db.add(InterviewQuestion(
                category=q["category"],
                target_role=q["target_role"],
                question=q["question"],
                difficulty=q["difficulty"],
                sample_answer_framework=q["sample_answer_framework"],
                evaluation_criteria_json=json.dumps(q["criteria"])
            ))

    # 6. Skill Assessments (MCQs for interactive quizzes)
    assessments_data = [
        {
            "skill_name": "Python",
            "question": "In Python, what is the key difference between a list and a tuple?",
            "options": [
                "Tuples are mutable while lists are immutable",
                "Lists are mutable while tuples are immutable",
                "Tuples can only store homogeneous data types",
                "Lists cannot be sliced using indexing"
            ],
            "correct_answer": 1,
            "explanation": "Lists are mutable (their elements can be added, removed, or changed in-place), whereas tuples are immutable once instantiated.",
            "difficulty": "Beginner"
        },
        {
            "skill_name": "SQL",
            "question": "Which SQL clause is used to filter records resulting from a GROUP BY aggregation?",
            "options": ["WHERE", "HAVING", "FILTER BY", "ORDER BY"],
            "correct_answer": 1,
            "explanation": "HAVING filters groups of rows created by GROUP BY, while WHERE filters individual rows before grouping occurs.",
            "difficulty": "Beginner"
        },
        {
            "skill_name": "Machine Learning",
            "question": "Which metric is most appropriate for evaluating a classification model on an imbalanced dataset where the positive class is rare (e.g., fraud detection)?",
            "options": ["Accuracy", "Mean Squared Error", "Precision-Recall AUC / F1-Score", "R-Squared"],
            "correct_answer": 2,
            "explanation": "On highly imbalanced datasets, simple accuracy is misleading (a naive classifier predicting majority class achieves high accuracy). PR-AUC or F1-Score balances Precision and Recall for the minority positive class.",
            "difficulty": "Intermediate"
        },
        {
            "skill_name": "React.js",
            "question": "What is the primary purpose of the useEffect hook in React functional components?",
            "options": [
                "To manage local component state variables",
                "To perform side effects such as data fetching, subscriptions, or manual DOM mutations",
                "To memoize expensive mathematical computations across re-renders",
                "To bind events directly to window objects only"
            ],
            "correct_answer": 1,
            "explanation": "useEffect lets you synchronize a component with external systems (performing side effects like HTTP calls, timers, or event subscriptions).",
            "difficulty": "Intermediate"
        }
    ]

    for a in assessments_data:
        existing_a = db.query(SkillAssessment).filter(SkillAssessment.question == a["question"]).first()
        if not existing_a:
            db.add(SkillAssessment(
                skill_name=a["skill_name"],
                question=a["question"],
                options_json=json.dumps(a["options"]),
                correct_answer=a["correct_answer"],
                explanation=a["explanation"],
                difficulty=a["difficulty"]
            ))

    db.commit()
    print("Database seeding completed successfully.")

