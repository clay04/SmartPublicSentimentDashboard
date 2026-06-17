from langchain_ollama import ChatOllama
from app.core.config import LOCAL_LLM_BASE_URL

local_llm_master = ChatOllama(
    base_url=LOCAL_LLM_BASE_URL,
    model="qwen3:1.7b",
    temperature=0,
    format="json",
    stream=False,
    num_predict=256,
    num_ctx=2048
)

local_llm_fallback = ChatOllama(
    base_url=LOCAL_LLM_BASE_URL,
    model="qwen2.5:3b",
    temperature=0,
    format="json",
    stream=False,
    num_predict=256,
    num_ctx=2048
)