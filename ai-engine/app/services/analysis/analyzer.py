import hashlib
import json

from app.core.logger import logger
from app.core.redis_client import redis_client
# from app.services.llm.gemini_service import llm
# from app.services.llm.groq_service import groq_llm
from app.services.llm.lokalllm_service import local_llm_master, local_llm_fallback
from app.services.rag.retriever import get_retriever
from app.models.response_models import AnalyzeResponse, LLMAnalysisOutput
from app.services.geocoding.osm_services import geocode_location

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

    prompt = f"""
    You are an Indonesian government AI system.

    Analyze the complaint.

    Return:

    - sentiment
    - category
    - urgency
    - recommendation
    - regulation_context
    - location

    Location must be the city, district, regency, province,
    or place mentioned in the complaint.

    Complaint:
    {text}

    Government SOP Context:
    {context}
    """

    structured_master = local_llm_master.with_structured_output(LLMAnalysisOutput)
    structured_fallback = local_llm_fallback.with_structured_output(LLMAnalysisOutput)

    parsed_output = None

    # --- PROSES LLM DENGAN FALLBACK YANG AMAN ---
    try:
        logger.info("Sending request to Local Qwen 1.5B")
        ai_response = structured_master.invoke(prompt)
        parsed_output = ai_response.model_dump()

    except Exception as master_err:
        logger.warning(f"Gemini failed: {str(master_err)}. Falling back to Qwen 1.5B")
        
        try:
            logger.info("Sending request to Local Qwen 3B")
            ai_response = structured_fallback.invoke(prompt)
            parsed_output = ai_response.model_dump()
        except Exception as groq_err:
            logger.error(f"Both Local LLMs Failed. Error: {str(groq_err)}")
    
    # --- PROSES INTEGRASI DATA & CACHING ---
    if parsed_output:
        location = parsed_output.get("location")
        coordinates = None
        
        if location and location.strip():
            try:
                coordinates = await geocode_location(location)
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

    # --- FALLBACK DEFAULT (Jika Gemini & Groq sama-sama Down/Error) ---
    return {
        "sentiment": "unknown",
        "category": "unknown",
        "urgency": "unknown",
        "recommendation": "Failed to parse AI response or both LLM models down",
        "regulation_context": "",
        "source_document": source_document,
        "location": None,
        "latitude": None,
        "longitude": None
    }