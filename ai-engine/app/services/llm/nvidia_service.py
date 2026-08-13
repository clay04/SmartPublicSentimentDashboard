from langchain_openai import ChatOpenAI
from app.core.config import NVIDIA_API_KEY

# Master Model: Llama 3.1 70B via NVIDIA NIM
nvidia_analyzer = ChatOpenAI(
    model="meta/llama-3.1-70b-instruct",
    openai_api_key=NVIDIA_API_KEY,
    openai_api_base="https://integrate.api.nvidia.com/v1",
    temperature=0.2,
    max_retries=1,
    timeout=30
)