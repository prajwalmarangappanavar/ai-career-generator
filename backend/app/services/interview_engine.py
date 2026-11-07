import json
import re
from typing import Any, Dict, List, Optional
from app.services.ai_engine import ai_engine

class InterviewEngine:
    """Evaluates student interview answers across relevance, technical correctness,

    clarity, communication, and STAR-method structure.
    """

    @staticmethod
    async def evaluate_answer(
        question_text: str,
        student_answer: str,
        target_role: str,
        category: str = "technical"
    ) -> Dict[str, Any]:
        """Evaluate student answer using LLM or local rubric heuristic."""

        prompt = f"""
You are an expert technical interviewer and placement coach assessing a university student.
Target Role: {target_role}
Interview Category: {category}

Question Asked:
"{question_text}"

Student's Answer:
"{student_answer}"

Evaluate the answer thoroughly against these criteria:
1. Relevance (1-10)
2. Technical Correctness (1-10)
3. Clarity and Articulation (1-10)
4. Communication and Structure (1-10)
5. STAR method evaluation (Situation, Task, Action, Result) if behavioral/project question.
6. Missing key concepts that a hiring manager would expect to hear.
7. Specific constructive coaching tips to level up this response.

Return a valid raw JSON object matching this structure:
{{
  "relevance_score": 8,
  "technical_score": 8,
  "clarity_score": 8,
  "communication_score": 8,
  "overall_score": 8,
  "constructive_feedback": "Detailed paragraph of constructive feedback praising strengths and explaining specifically how to improve.",
  "missing_concepts": ["concept 1", "concept 2"],
  "suggested_improvements": "Actionable revised answer snippet or improved phrasing.",
  "star_method_analysis": {{
    "has_situation": true,
    "has_task": true,
    "has_action": true,
    "has_result": true,
    "feedback": "Evaluation of whether the candidate stated clear actions and quantifiable results."
  }}
}}
"""
        schema_desc = "JSON object with relevance_score, technical_score, clarity_score, communication_score, overall_score, constructive_feedback, missing_concepts, suggested_improvements, star_method_analysis"
        ai_resp = await ai_engine.generate_json(prompt, schema_desc)

        if ai_resp.get("is_live_ai") and ai_resp.get("data"):
            data = ai_resp["data"]
            data["is_live_ai"] = True
            return data

        # Fallback to local heuristic evaluation
        return InterviewEngine._evaluate_local(question_text, student_answer, category)

    @staticmethod
    def _evaluate_local(question_text: str, student_answer: str, category: str) -> Dict[str, Any]:
        words = student_answer.strip().split()
        word_count = len(words)

        # Baseline scoring based on depth and content
        if word_count < 15:
            relevance = 5
            tech = 4
            clarity = 5
            comm = 4
            feedback = "Your answer was very brief. In technical and HR interviews, aim to elaborate with specific context, technical examples, or quantifiable outcomes."
            missing = ["Concrete real-world examples", "Detailed technical reasoning"]
        elif word_count < 50:
            relevance = 7
            tech = 7
            clarity = 7
            comm = 7
            feedback = "Good initial response. You addressed the core question well, but adding a specific project scenario or benchmark would make your answer memorable."
            missing = ["Trade-off analysis", "Measurable result or benchmark"]
        else:
            relevance = 9
            tech = 8
            clarity = 9
            comm = 8
            feedback = "Strong, structured response! You articulated the concept clearly with good technical vocabulary and depth."
            missing = ["Edge-case considerations"]

        # STAR Check
        has_situation = bool(re.search(r'\b(when|while|during|at|in my project|situation)\b', student_answer, re.I))
        has_task = bool(re.search(r'\b(needed to|had to|responsible|task|goal|objective)\b', student_answer, re.I))
        has_action = bool(re.search(r'\b(implemented|built|engineered|analyzed|refactored|designed|used)\b', student_answer, re.I))
        has_result = bool(re.search(r'\b(result|achieved|reduced|improved|outcome|successfully|led to)\b', student_answer, re.I))

        overall = int((relevance + tech + clarity + comm) / 4)

        return {
            "relevance_score": relevance,
            "technical_score": tech,
            "clarity_score": clarity,
            "communication_score": comm,
            "overall_score": overall,
            "constructive_feedback": feedback,
            "missing_concepts": missing,
            "suggested_improvements": "Begin with a crisp 1-sentence definition, followed by an architectural tradeoff or project achievement, and conclude with the business impact.",
            "star_method_analysis": {
                "has_situation": has_situation,
                "has_task": has_task,
                "has_action": has_action,
                "has_result": has_result,
                "feedback": "Clear progression from context to action. Always quantify the end result where possible (e.g., latency, users, % improvement)." if (has_action and has_result) else "Include explicit action verbs and specify the end result achieved."
            },
            "is_live_ai": False
        }

interview_engine = InterviewEngine()

