from langchain_groq import ChatGroq

from app.core.config import GROQ_API_KEY

groq_llm = ChatGroq(
    groq_api_key=GROQ_API_KEY,
    model_name="openai/gpt-oss-20b",
    temperature=0.1
)