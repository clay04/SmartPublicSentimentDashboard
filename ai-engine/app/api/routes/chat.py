from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from app.core.securrityChat import verify_api_key
from app.services.chat.chat import sentiment_chat


router = APIRouter()


class ChatMessage(BaseModel):
    role: str
    text: str


class NewsContextItem(BaseModel):
    id: Optional[str] = None

    title: str
    content: str

    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    sentiment: Optional[str] = None
    category: Optional[str] = None
    urgency: Optional[str] = None

    source: Optional[str] = None


class ChatRequest(BaseModel):
    question: str

    chat_history: Optional[List[ChatMessage]] = None

    news_context: Optional[List[NewsContextItem]] = None


@router.post(
    "/chat",
    dependencies=[Depends(verify_api_key)]
)
async def chat_endpoint(request: ChatRequest):

    try:

        # Convert Pydantic model → dict
        history = [
            msg.model_dump()
            for msg in (request.chat_history or [])
        ]

        news_data = [
            news.model_dump()
            for news in (request.news_context or [])
        ]

        result = await sentiment_chat(
            question=request.question,
            chat_history=history,
            news_context=news_data
        )

        if result["status"] == "error":
            raise HTTPException(
                status_code=500,
                detail=result["answer"]
            )

        return result

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )