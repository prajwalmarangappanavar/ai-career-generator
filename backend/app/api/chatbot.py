import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_current_student_profile, get_current_user
from app.db.models import ChatbotConversation, StudentProfile, User
from app.db.session import get_db
from app.schemas.content import ChatRequest, ChatResponse
from app.services.chatbot_engine import chatbot_engine

router = APIRouter(prefix="/chatbot", tags=["AI Career Chatbot"])

@router.post("/message", response_model=ChatResponse)
async def send_chat_message(
    req: ChatRequest,
    current_user: User = Depends(get_current_user),
    profile: StudentProfile = Depends(get_current_student_profile),
    db: Session = Depends(get_db)
):
    """Interact with profile-grounded career counselor."""
    conv = None
    if req.conversation_id:
        conv = db.query(ChatbotConversation).filter(
            ChatbotConversation.id == req.conversation_id,
            ChatbotConversation.user_id == current_user.id
        ).first()

    if not conv:
        conv = ChatbotConversation(
            user_id=current_user.id,
            title="Career Planning Session",
            messages_json="[]"
        )
        db.add(conv)
        db.flush()

    messages = json.loads(conv.messages_json or "[]")
    
    # Call chatbot engine
    resp = await chatbot_engine.chat(req.message, profile, messages)

    # Append user & assistant messages
    now_str = datetime.now(timezone.utc).isoformat()
    messages.append({"role": "user", "content": req.message, "timestamp": now_str})
    messages.append({
        "role": "assistant",
        "content": resp["reply"],
        "timestamp": now_str,
        "suggested_followups": resp.get("suggested_followups", [])
    })

    conv.messages_json = json.dumps(messages)
    db.commit()

    return ChatResponse(
        conversation_id=conv.id,
        reply=resp["reply"],
        suggested_followups=resp.get("suggested_followups", []),
        is_live_ai=resp.get("is_live_ai", False)
    )

@router.get("/history")
def get_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve chat history."""
    conv = db.query(ChatbotConversation).filter(
        ChatbotConversation.user_id == current_user.id
    ).order_by(ChatbotConversation.id.desc()).first()

    if not conv:
        return {"conversation_id": None, "messages": []}

    return {
        "conversation_id": conv.id,
        "title": conv.title,
        "messages": json.loads(conv.messages_json or "[]")
    }

