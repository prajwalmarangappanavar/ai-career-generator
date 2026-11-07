from typing import Any, Dict, List
from app.db.models import StudentProfile
from app.services.ai_engine import ai_engine
from app.services.consistency_engine import consistency_engine

class ChatbotEngine:
    """Context-aware Career Guidance Chatbot grounded in the student's profile."""

    @staticmethod
    async def chat(user_message: str, profile: StudentProfile, conversation_history: List[Dict[str, str]]) -> Dict[str, Any]:
        facts = consistency_engine.get_profile_facts(profile)

        student_context = (
            f"Student Name: {facts['full_name']}\n"
            f"Degree: {', '.join(facts['degrees']) if facts['degrees'] else 'CS'}\n"
            f"Verified Skills: {', '.join(facts['skills'])}\n"
            f"Completed Projects: {', '.join(facts['projects'])}\n"
            f"Target Role: {facts['target_role']}\n"
            f"Readiness Score: {profile.career_readiness_score}%\n"
        )

        prompt = f"""
You are the CareerPulse AI Counselor. You guide college students in technology career planning, placement preparation, and skill acquisition.
CRITICAL RULE: Base your guidance strictly on the student's actual background and target role. Do NOT assume fake qualifications.

Student Profile Context:
{student_context}

User Question:
"{user_message}"

Respond with an empathetic, highly structured, practical, and motivating answer (2-3 concise paragraphs or bullet points).
Then provide 3 relevant follow-up questions the student might want to ask next.

Output JSON format:
{{
  "reply": "Your markdown-formatted guidance response here.",
  "suggested_followups": [
    "Suggested question 1?",
    "Suggested question 2?",
    "Suggested question 3?"
  ]
}}
"""
        schema_desc = "JSON object with reply and suggested_followups list"
        ai_resp = await ai_engine.generate_json(prompt, schema_desc, system_instruction="You are a professional placement mentor.")

        if ai_resp.get("is_live_ai") and ai_resp.get("data"):
            data = ai_resp["data"]
            data["is_live_ai"] = True
            return data

        # Fallback local contextual reply
        return ChatbotEngine._chat_local(user_message, facts)

    @staticmethod
    def _chat_local(message: str, facts: Dict[str, Any]) -> Dict[str, Any]:
        msg = message.lower()
        role = facts["target_role"]
        top_skills = ", ".join(facts["skills"][:3]) if facts["skills"] else "Python and SQL"

        if "skill" in msg or "learn" in msg:
            reply = (
                f"### 🎯 Strategic Skills for Your Target Role ({role})\n\n"
                f"Based on your current strengths in **{top_skills}**, here are the top 3 high-impact skills you should prioritize next:\n\n"
                f"1. **Cloud & Containerization (Docker)**: Package your applications into deployable containers.\n"
                f"2. **Production System Design**: Learn caching, rate limiting, and database indexing.\n"
                f"3. **CI/CD Automation**: Set up automated testing workflows with GitHub Actions.\n\n"
                f"💡 *Tip:* Check out the **Learning Roadmap** tab to track your week-by-week progress!"
            )
            followups = [
                "What projects will best demonstrate these skills?",
                "How do I prepare for technical interviews?",
                "Can you review my resume ATS score?"
            ]
        elif "resume" in msg or "ats" in msg:
            reply = (
                f"### 📄 Resume Optimization Advice\n\n"
                f"To maximize your callback rates for **{role}** positions:\n\n"
                f"• **Quantify Outcomes**: Convert passive descriptions into metrics (e.g., 'Reduced query latency by 32%').\n"
                f"• **Lead with Action Verbs**: Begin each bullet with strong verbs like *Engineered, Architected, Optimized*.\n"
                f"• **Feature Your Strongest Project**: Showcase your work on **{facts['projects'][0] if facts['projects'] else 'full-stack applications'}** right after your education section.\n\n"
                f"You can use our **AI Resume Builder** to generate and download an ATS-tailored PDF!"
            )
            followups = [
                "What skills are missing from my resume?",
                "How do I draft a matching cover letter?",
                "Can we practice mock interview questions?"
            ]
        elif "interview" in msg or "placement" in msg:
            reply = (
                f"### 💼 Placement & Interview Readiness\n\n"
                f"For {role} campus and off-campus placements, interviewers look for:\n\n"
                f"1. **DSA & Core CS Fundamentals**: Solid mastery of arrays, hash maps, trees, and SQL joins.\n"
                f"2. **STAR Method for Behavioral Questions**: Clearly structuring Situation, Task, Action, and Result.\n"
                f"3. **Project Deep-Dive**: Be ready to explain tradeoffs, bottlenecks, and what you would do differently.\n\n"
                f"Head over to our **Mock Interview** tab to do interactive practice with real-time scoring!"
            )
            followups = [
                "Give me a sample technical question for my role.",
                "How do I answer 'Tell me about yourself'?",
                "Which companies hire for this profile?"
            ]
        else:
            reply = (
                f"Hello {facts['full_name']}! 👋 As you prepare for opportunities as a **{role}**, "
                f"I'm here to assist with skill-gap analysis, resume tailoring, roadmaps, and interview drills.\n\n"
                f"Your profile shows verified expertise in **{top_skills}**. How can I best assist your preparation today?"
            )
            followups = [
                f"What skills should I learn next for {role}?",
                "How can I improve my resume for campus placements?",
                "Start a mock interview session for me."
            ]

        return {
            "reply": reply,
            "suggested_followups": followups,
            "is_live_ai": False
        }

chatbot_engine = ChatbotEngine()

