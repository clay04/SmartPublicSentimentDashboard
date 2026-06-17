import hashlib
import json
import re
from html import unescape

from app.core.logger import logger
from app.core.redis_client import redis_client
from app.services.llm.lokalllm_service import local_llm_master, local_llm_fallback
# from app.services.rag.retriever import get_retriever
from app.models.response_models import AnalyzeResponse, LLMAnalysisOutput
from app.services.geocoding.osm_services import geocode_location

def clean_text(text: str) -> str:
    """Hapus HTML tags, decode entities, normalize whitespace."""
    text = re.sub(r'<[^>]+>', '', text)
    text = unescape(text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


async def analyze_text(text: str):    
    # Bersihkan HTML sebelum apapun
    text = clean_text(text)
    logger.info(f"Analyzing text: {text}")

    cache_key = hashlib.md5(text.encode()).hexdigest()
    cached = redis_client.get(cache_key)

    if cached:
        logger.info("Cache hit")
        return json.loads(cached)

    # retriever = get_retriever()
    # docs = retriever.invoke(text)
    # context = "\n\n".join([doc.page_content for doc in docs])
    # logger.info(f"Docs retrieved: {len(docs)}")
    # logger.info(f"Context length (chars): {len(context)}")
    # logger.info(f"Context length (approx tokens): {len(context) // 4}")

    source_document = None
    # if docs:
    #     source_document = docs[0].metadata.get("source_file")

    prompt = f"""/no_think
You are an Indonesian government AI system.
Analyze the complaint and return ONLY valid JSON. No comments, no explanation.

Rules:
- sentiment must be exactly one of: positive, neutral, negative (lowercase)
- category must be a single string, not an array
- urgency must be exactly one of: low, medium, high (lowercase)
- recommendation: provide a short action recommendation in Indonesian, max 2 sentences
- regulation_context: use empty string "" if not available, no comments
- location: city, district, or province mentioned, or null if none
- All values must be strings, no arrays, no null except location
- You MUST include ALL fields: sentiment, category, urgency, recommendation, regulation_context, location

Complaint:
{text}
"""
    logger.info(f"Prompt length (chars): {len(prompt)}")
    logger.info(f"Prompt length (approx tokens): {len(prompt) // 4}")
    
    structured_master = local_llm_master.with_structured_output(LLMAnalysisOutput, include_raw=True)
    structured_fallback = local_llm_fallback.with_structured_output(LLMAnalysisOutput, include_raw=True)

    parsed_output = None

    # --- LLM DENGAN FALLBACK ---
    try:
        logger.info("Sending request to Qwen2 3B (master)")
        ai_response = structured_master.invoke(prompt)
        logger.info(f"AI Response RAW: {ai_response}")
        if ai_response is None:
            raise ValueError("Master LLM returned None")
        parsed_output = ai_response.model_dump()

    except Exception as master_err:
        logger.warning(f"Master LLM failed: {str(master_err)}. Falling back to Qwen3 1.7B")

        try:
            logger.info("Sending request to Qwen3 1.7B (fallback)")
            ai_response = structured_fallback.invoke(prompt)
            logger.info(f"AI Response: {ai_response}")
            if ai_response is None:
                raise ValueError("Fallback LLM returned None")
            parsed_output = ai_response.model_dump()

        except Exception as fallback_err:
            logger.error(f"Both LLMs failed. Error: {str(fallback_err)}")

    # --- INTEGRASI DATA & CACHING ---
    if parsed_output:
        # Normalize location capitalization
        location = parsed_output.get("location")
        if location and location.strip():
            parsed_output["location"] = location.strip().title()

        coordinates = None
        if parsed_output.get("location"):
            try:
                coordinates = await geocode_location(parsed_output["location"])
            except Exception as geo_err:
                logger.error(f"Geocoding failed: {str(geo_err)}")

        try:
            final_response = AnalyzeResponse(
                **parsed_output,
                source_document=source_document,
                latitude=coordinates.get("latitude") if coordinates else None,
                longitude=coordinates.get("longitude") if coordinates else None
            )
            final_data = final_response.model_dump()
            redis_client.setex(cache_key, 3600, json.dumps(final_data))
            return final_data

        except Exception as e:
            logger.error(f"Error packing final output: {str(e)}")

    # --- FALLBACK DEFAULT — "unknown" aman karena AnalyzeResponse pakai str biasa ---
    return AnalyzeResponse(
        sentiment="unknown",
        category="unknown",
        urgency="unknown",
        recommendation="Failed to parse AI response or both LLM models down",
        regulation_context="",
        source_document=source_document,
        location=None,
        latitude=None,
        longitude=None
    ).model_dump()