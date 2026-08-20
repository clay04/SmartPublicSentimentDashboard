from langchain_google_genai import ChatGoogleGenerativeAI

from app.core.config import GEMINI_API_KEY
from app.utils.rotator import AsyncRotator

gemini_instances = [
    ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=key,
        temperature=0.2,
        max_retries=1,
        timeout=30,
    )
    for key in GEMINI_API_KEY
]

gemini_rotator = AsyncRotator(gemini_instances)


async def get_gemini_llm() -> ChatGoogleGenerativeAI:
    return await gemini_rotator.get_next()