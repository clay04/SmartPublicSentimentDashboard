import hashlib
import json

from app.core.logger import logger
from app.core.redis_client import redis_client
from app.services.geocoding.geocode_service import extract_location
from app.services.llm.gemini_service import llm
from app.services.llm.groq_service import groq_llm
from app.services.rag.retriever import get_retriever


async def analyze_text(text: str):
    logger.info(f"Analyzing text: {text}")

    cache_key = hashlib.md5(text.encode()).hexdigest()

    cached = redis_client.get(cache_key)

    if cached:
        logger.info("Cache hit")
        return json.loads(cached)
    
    retriever = get_retriever()
    docs = retriever.invoke(text)

    context = "\n\n".join([
        doc.page_content for doc in docs
    ])

    source_document = None

    if docs:
        source_document = docs[0].metadata.get("source_file")

    location = extract_location(text)

    prompt = f"""
You are an Indonesian government AI system.

Analyze the complaint below.

Complaint:
{text}

Government SOP Context:
{context}

Return ONLY valid JSON.

{{
  "sentiment": "positive/neutral/negative",
  "category": "...",
  "urgency": "low/medium/high",
  "confidence": 0.0,
  "recommendation": "...",
  "regulation_context": "..."
}}
"""

    try:
        response = llm.invoke(prompt)

    except Exception:
        logger.warning("Gemini failed, fallback to Groq")

        response = groq_llm.invoke(prompt)

    try:
        parsed = json.loads(response.content)

        parsed["source_document"] = source_document
        parsed["location"] = location

        redis_client.setex(
            cache_key,
            3600,
            json.dumps(parsed)
        )

        return parsed

    except Exception as e:
        logger.error(str(e))

        return {
            "sentiment": "unknown",
            "category": "unknown",
            "urgency": "unknown",
            "confidence": 0.0,
            "recommendation": "Failed to parse AI response",
            "regulation_context": "",
            "source_document": source_document,
            "location": location
        }