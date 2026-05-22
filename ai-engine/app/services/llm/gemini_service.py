from langchain_google_genai import ChatGoogleGenerativeAI

from app.core.config import GEMINI_API_KEY

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=GEMINI_API_KEY,
    temperature=0.2,
    max_retries=1
)