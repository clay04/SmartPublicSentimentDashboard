from langchain_ollama import ChatOllama

from app.core.config import LOCAL_LLM_BASE_URL

local_llm_master = ChatOllama(
    base_url=LOCAL_LLM_BASE_URL, 
    model="qwen2.5-coder:3b",
    temperature=0,
    format="json"
)

local_llm_fallback = ChatOllama(
    base_url=LOCAL_LLM_BASE_URL, 
    model="qwen2.5-coder:1.5b",
    temperature=0,
    format="json"
)