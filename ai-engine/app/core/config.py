import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = [
    k.strip()
    for k in os.getenv("GEMINI_API_KEY", "").split(",")
    if k.strip()
]

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")

GROQ_API_KEYS_ANALYZER = [
    k.strip()
    for k in os.getenv("GROQ_API_KEY_ANALYZER", "").split(",")
    if k.strip()
]

REDIS_HOST = os.getenv("REDIS_HOST")
REDIS_PORT = int(os.getenv("REDIS_PORT"))

MONGODB_URI = os.getenv("MONGODB_URI")

LOCAL_LLM_BASE_URL = os.getenv("LOCAL_LLM_BASE_URL")

INTERNAL_API_KEY = os.getenv("INTERNAL_API_KEY")
