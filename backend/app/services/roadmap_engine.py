import json
from typing import Any, Dict, List
from sqlalchemy.orm import Session
from app.db.models import LearningRoadmap, RoadmapTask, StudentProfile, LearningResource

class RoadmapEngine:
    """Personalized Career Roadmap Generator producing 30d, 60d, 90d, 6m, and 1y plans."""

    @staticmethod
    def generate_roadmap(profile: StudentProfile, target_role: str, timeframe: str, db: Session) -> LearningRoadmap:
        # Check if an existing roadmap exists for this profile, target_role, and timeframe
        existing = db.query(LearningRoadmap).filter(
            LearningRoadmap.profile_id == profile.id,
            LearningRoadmap.target_role == target_role,
            LearningRoadmap.timeframe == timeframe
        ).first()

        if existing:
            return existing

        # Determine number of weeks based on timeframe
        weeks_map = {
            "30_days": 4,
            "60_days": 8,
            "90_days": 12,
            "6_months": 24,
            "1_year": 52
        }
        total_weeks = weeks_map.get(timeframe, 12)

        roadmap = LearningRoadmap(
            profile_id=profile.id,
            target_role=target_role,
            timeframe=timeframe,
            total_milestones=total_weeks,
            completed_milestones=0,
            is_active=True
        )
        db.add(roadmap)
        db.flush()

        # Retrieve relevant resources from database
        all_resources = db.query(LearningResource).all()

        # Build progressive weekly milestone curriculum
        tasks_data = RoadmapEngine._generate_weekly_plan(target_role, total_weeks, all_resources)

        for item in tasks_data:
            task = RoadmapTask(
                roadmap_id=roadmap.id,
                week_number=item["week_number"],
                title=item["title"],
                description=item["description"],
                skill_target=item["skill_target"],
                resource_links_json=json.dumps(item["resources"]),
                is_completed=False,
                notes="",
                deadline=f"Week {item['week_number']}"
            )
            db.add(task)

        db.commit()
        db.refresh(roadmap)
        return roadmap

    @staticmethod
    def _generate_weekly_plan(target_role: str, weeks: int, resources: List[LearningResource]) -> List[Dict[str, Any]]:
        plan: List[Dict[str, Any]] = []

        curriculums = {
            "AI/ML Engineer": [
                ("Advanced Python & Vectorized Operations", "Master NumPy array manipulation, broadcasting, vectorization, and memory profiling.", "Python / NumPy"),
                ("Linear Algebra & Statistical Foundations", "Review matrix decompositions (SVD, PCA), probability distributions, hypothesis testing, and Bayes theorem.", "Mathematics & Statistics"),
                ("Supervised Machine Learning from Scratch", "Implement Linear/Logistic Regression, Decision Trees, and Gradient Boosting. Evaluate with PR-AUC, ROC, and F1.", "Machine Learning"),
                ("Unsupervised Learning & Dimensionality Reduction", "Master K-Means clustering, hierarchical clustering, t-SNE, and Principal Component Analysis.", "Data Preprocessing"),
                ("Deep Learning Fundamentals with PyTorch", "Understand autograd, backpropagation, MLP architectures, activation functions, and optimizer dynamics.", "Deep Learning / PyTorch"),
                ("Convolutional Neural Networks (CNNs)", "Build image classification models with PyTorch. Implement Transfer Learning with ResNet and EfficientNet.", "Computer Vision"),
                ("Sequence Models & Transformer Architectures", "Explore RNNs, LSTMs, Attention mechanisms, Self-Attention, and modern BERT/GPT architecture.", "NLP / Transformers"),
                ("Data Engineering & Feature Store Pipelines", "Build scalable ETL data pipelines using Pandas, DuckDB, and SQL. Design reproducible data splits.", "SQL & Data Pipelines"),
                ("Model Evaluation, Validation & Drift Detection", "Implement K-Fold Cross-Validation, SHAP model explainability, bias auditing, and concept drift detection.", "Model Evaluation"),
                ("MLOps & Containerized Microservices", "Wrap trained PyTorch/ONNX models in a high-throughput FastAPI REST API. Package with multi-stage Docker.", "Docker & FastAPI"),
                ("End-to-End Capstone Production ML Project", "Develop, benchmark, test, and deploy a full-scale AI application with CI/CD automation.", "Full-Stack AI"),
                ("Portfolio Polishing & Technical Interview Drill", "Refine GitHub repository documentation, benchmark live demos, and practice ML engineering algorithmic challenges.", "Placement Preparation")
            ],
            "Full-Stack Software Developer": [
                ("Modern TypeScript & Advanced JavaScript", "Deep dive into TypeScript generics, utility types, asynchronous event loops, and closures.", "TypeScript"),
                ("Frontend Component Architecture with React", "Component lifecycles, custom hooks, memoization (useMemo/useCallback), and modern state patterns.", "React.js"),
                ("Clean RESTful API Design with FastAPI/Node", "Design semantic REST endpoints, Pydantic validation, dependency injection, and JWT auth.", "Backend APIs"),
                ("Relational Database Modeling & Indexing", "PostgreSQL schema normalization (3NF), complex joins, foreign keys, index tuning, and transaction ACID.", "SQL & PostgreSQL"),
                ("State Management & Client Cache Optimization", "Master TanStack React Query for server cache invalidation and global Zustand state store.", "Frontend Engineering"),
                ("Microservices & Containerization with Docker", "Write clean Dockerfiles, compose multi-container environments (App + DB + Redis cache).", "Docker"),
                ("Automated Testing Suite (Unit, Integration, E2E)", "Implement backend testing with Pytest/Jest and frontend component testing with Playwright/Testing Library.", "Software Quality & Testing"),
                ("Cloud Deployment & CI/CD Pipelines", "Automate linting, unit tests, and automated deployment via GitHub Actions to cloud environments.", "DevOps & CI/CD"),
                ("Web Security Essentials (OWASP Top 10)", "Mitigate CSRF, XSS, SQL Injection, enforce CORS policies, rate limiting, and secure HTTP headers.", "Web Security"),
                ("Caching, Message Queues & System Scaling", "Integrate Redis caching layer and asynchronous background job queues for long-running processes.", "System Architecture"),
                ("End-to-End Enterprise SaaS Capstone", "Architect and ship a full-stack multi-tenant web application featuring authentication and payments.", "Full-Stack Project"),
                ("Resume Tuning, Mock Technical Interviews & LeetCode", "Practice medium DSA problems, system design fundamentals, and rehearse STAR behavioral answers.", "Placement Preparation")
            ]
        }

        default_curriculum = curriculums.get(target_role, curriculums["Full-Stack Software Developer"])

        for w in range(1, weeks + 1):
            curr_idx = (w - 1) % len(default_curriculum)
            title, desc, skill = default_curriculum[curr_idx]

            # Match 1-2 resources
            matched_res = []
            for r in resources:
                skills_cov = json.loads(r.skills_covered_json or "[]")
                if any(s.lower() in skill.lower() for s in skills_cov) or r.title.lower() in title.lower():
                    matched_res.append({"title": r.title, "url": r.url, "provider": r.provider})
                if len(matched_res) >= 2:
                    break

            if not matched_res and resources:
                matched_res.append({"title": resources[0].title, "url": resources[0].url, "provider": resources[0].provider})

            plan.append({
                "week_number": w,
                "title": f"Week {w}: {title}",
                "description": desc,
                "skill_target": skill,
                "resources": matched_res
            })

        return plan

roadmap_engine = RoadmapEngine()

