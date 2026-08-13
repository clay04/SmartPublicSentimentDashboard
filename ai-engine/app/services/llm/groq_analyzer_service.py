from langchain_groq import ChatGroq
from app.core.config import GROQ_API_KEY_ANALYZER

groq_analyzer = ChatGroq(
    model_name="llama-3.3-70b-versatile",
    groq_api_key=GROQ_API_KEY_ANALYZER,
    temperature=0.1,
    max_retries=1,
    timeout=30
)