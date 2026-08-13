from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.core.securrityChat import verify_api_key
from app.services.chat.chat import sentiment_chat

router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    text: str

class NewsContextitem(BaseModel):
    title: str
    content: str
    sentiment: Optional[str] = "neutral"

class ChatRequest(BaseModel):
    question: str
    chat_history: Optional[List[ChatMessage]] = []
    news_context: Optional[List[NewsContextitem]] = []

@router.post("/chat", dependencies=[Depends(verify_api_key)])
async def chat_endpoint(request: ChatRequest):
    try:
        # Ubah Pydantic model ke dict untuk diteruskan ke service
        history = [msg.dict() for msg in request.chat_history] if request.chat_history else []

        news_data = [news.dict() for news in request.news_context] if request.news_context else []
        
        result = sentiment_chat(
            question=request.question,
            chat_history=history,
            news_context=news_data
        )
        
        if result["status"] == "error":
            raise HTTPException(status_code=500, detail=result["answer"])
            
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
