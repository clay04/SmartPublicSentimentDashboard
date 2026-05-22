from langchain_groq import ChatGroq

from app.core.config import GROQ_API_KEY

groq_llm = ChatGroq(
    groq_api_key=GROQ_API_KEY,
    model_name="llama3-70b-8192",
    temperature=0.1
)