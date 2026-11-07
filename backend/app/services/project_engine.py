from typing import Any, Dict, List
from app.db.models import StudentProfile

class ProjectEngine:
    """Recommends practical, portfolio-grade projects based on skill level and target career."""

    @staticmethod
    def get_recommendations(profile: StudentProfile, target_role: str) -> List[Dict[str, Any]]:
        projects_pool = {
            "AI/ML Engineer": [
                {
                    "title": "Real-Time Multi-Modal Document Q&A Agent",
                    "difficulty": "Advanced",
                    "technologies": "Python, FastAPI, PyTorch, FAISS / ChromaDB, HuggingFace Transformers, Docker",
                    "problem_statement": "Enterprises struggle to query multimodal PDF invoices, research papers, and technical diagrams with low latency and verifiable citations.",
                    "description": "Architect an end-to-end RAG system with hybrid semantic search, OCR diagram parser, and streaming local LLM inference.",
                    "learning_objectives": "Vector embeddings, dense retrieval, chunking strategies, Dockerized microservice deployment.",
                    "expected_outcome": "Sub-400ms query response with precision recall > 88% and reproducible Docker Compose deployment.",
                    "milestones": [
                        "Phase 1: PDF ingestion & semantic chunking with PyMuPDF",
                        "Phase 2: Hybrid vector index creation with FAISS",
                        "Phase 3: FastAPI streaming inference endpoint",
                        "Phase 4: Docker containerization and load testing"
                    ]
                },
                {
                    "title": "Predictive Customer Churn Analytics Dashboard",
                    "difficulty": "Intermediate",
                    "technologies": "Python, Scikit-Learn, Pandas, FastAPI, React.js, Chart.js",
                    "problem_statement": "Subscription businesses lose revenue without early detection of high churn risk customer cohorts.",
                    "description": "Develop a churn classification pipeline featuring automated data preprocessing, XGBoost modeling, SHAP explainability, and an interactive React web dashboard.",
                    "learning_objectives": "Feature engineering, handling class imbalance (SMOTE), SHAP interpretability, REST API integration.",
                    "expected_outcome": "Trained model achieving 89%+ ROC-AUC with live prediction UI for customer success managers.",
                    "milestones": [
                        "Phase 1: Exploratory Data Analysis & Outlier Handling",
                        "Phase 2: Cross-validated Model Benchmark (Random Forest vs XGBoost)",
                        "Phase 3: SHAP Feature Importance Visualization",
                        "Phase 4: Web Application deployment"
                    ]
                },
                {
                    "title": "Automated Code Review & Bug Classifier",
                    "difficulty": "Beginner",
                    "technologies": "Python, Scikit-Learn, AST parser, GitHub API",
                    "problem_statement": "Students need automated feedback on code style, potential memory leaks, and antipatterns before git commits.",
                    "description": "Build a command-line tool that inspects Python scripts using Abstract Syntax Trees (AST) and flags security vulnerabilities and formatting antipatterns.",
                    "learning_objectives": "Python AST module, static analysis fundamentals, CLI development with Click.",
                    "expected_outcome": "Functional CLI checking codebases under 2 seconds and exporting clean JSON audit reports.",
                    "milestones": [
                        "Phase 1: AST parsing and rule mapping",
                        "Phase 2: Scoring algorithm implementation",
                        "Phase 3: Report generation and CLI testing"
                    ]
                }
            ],
            "Full-Stack Software Developer": [
                {
                    "title": "High-Throughput Collaborative Task Management SaaS",
                    "difficulty": "Advanced",
                    "technologies": "TypeScript, React, Node.js / FastAPI, PostgreSQL, Redis, WebSockets, Docker",
                    "problem_statement": "Distributed agile teams require instantaneous multi-user state synchronization and task kanban boards without page reloads.",
                    "description": "Engineer a production-grade Trello clone supporting real-time WebSocket state broadcasts, optimistic UI updates, RBAC permissions, and Redis pub/sub.",
                    "learning_objectives": "WebSockets bi-directional communication, Redis cache invalidation, database concurrency locks, optimistic UI.",
                    "expected_outcome": "Concurrent collaboration across 50+ simultaneous tabs with sub-50ms sync latency.",
                    "milestones": [
                        "Phase 1: Relational Schema & JWT Authorization",
                        "Phase 2: Kanban Drag-and-Drop Board in React",
                        "Phase 3: WebSocket Live Sync & Redis Pub/Sub",
                        "Phase 4: Production Docker Deploy & E2E Testing"
                    ]
                },
                {
                    "title": "E-Commerce Microservice with Payment Gateway Integration",
                    "difficulty": "Intermediate",
                    "technologies": "React, FastAPI, PostgreSQL, Stripe API, Tailwind CSS",
                    "problem_statement": "Retail platforms need secure order workflows, automated webhook verification, and instant inventory decrementing.",
                    "description": "Implement a full-featured online storefront with product catalog search, shopping cart persistence, Stripe checkout integration, and invoice generation.",
                    "learning_objectives": "Stripe webhooks, database transactions (ACID), state management, responsive UI design.",
                    "expected_outcome": "Complete checkout pipeline with automated email receipt dispatch and database inventory sync.",
                    "milestones": [
                        "Phase 1: Product catalog & filter UI",
                        "Phase 2: Cart state & persistent checkout session",
                        "Phase 3: Stripe API webhook handling",
                        "Phase 4: PDF invoice download integration"
                    ]
                },
                {
                    "title": "Personal Developer Portfolio with CMS & Analytics",
                    "difficulty": "Beginner",
                    "technologies": "React, Tailwind CSS, Markdown parser, LocalStorage",
                    "problem_statement": "Early-career developers need a showcase for their project portfolio with live demos, blog articles, and contact forms.",
                    "description": "Design an ultra-responsive, accessible developer portfolio featuring dark mode toggle, markdown blog viewer, and interactive resume viewer.",
                    "learning_objectives": "CSS Grid/Flexbox, accessible semantic HTML, client-side routing, component styling.",
                    "expected_outcome": "Lighthouse score 98+ on performance and accessibility.",
                    "milestones": [
                        "Phase 1: Layout & theme switcher",
                        "Phase 2: Markdown blog parser",
                        "Phase 3: Interactive project filter cards"
                    ]
                }
            ]
        }

        fallback_projects = projects_pool["Full-Stack Software Developer"]
        return projects_pool.get(target_role, fallback_projects)

project_engine = ProjectEngine()

