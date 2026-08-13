from langchain_openai import ChatOpenAI
from app.core.config import OPENROUTER_API_KEY

# Master Model: Gemma 4 31B (Free Tier)
openrouter_master = ChatOpenAI(
    model="openai/gpt-oss-20b:free",
    openai_api_key=OPENROUTER_API_KEY,
    openai_api_base="https://openrouter.ai/api/v1",
    temperature=0.1,
    max_retries=1,
    timeout=30
)

# Fallback Model: Gemma 4 26B A4B (Free Tier)
openrouter_fallback = ChatOpenAI(
    model="openrouter/free",
    openai_api_key=OPENROUTER_API_KEY,
    openai_api_base="https://openrouter.ai/api/v1",
    temperature=0.1,
    max_retries=1,
    timeout=30
)