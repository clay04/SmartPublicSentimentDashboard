from langchain_groq import ChatGroq

from app.core.config import GROQ_API_KEYS_ANALYZER
from app.utils.rotator import AsyncRotator

groq_instances = [
    ChatGroq(
        model_name="llama-3.3-70b-versatile",
        groq_api_key=key,
        temperature=0.1,
        max_retries=1,
        timeout=30,
    )
    for key in GROQ_API_KEYS_ANALYZER
]

groq_rotator = AsyncRotator(groq_instances)


async def get_groq_llm() -> ChatGroq:
    return await groq_rotator.get_next()