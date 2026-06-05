import hashlib
import json

from app.core.logger import logger
from app.core.redis_client import redis_client
from app.services.llm.gemini_service import llm
from app.services.llm.groq_service import groq_llm
from app.services.rag.retriever import get_retriever
from app.models.response_models import AnalyzeResponse 
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

    # Paksa kedua LLM untuk mematuhi skema Pydantic Anda
    structured_gemini = llm.with_structured_output(AnalyzeResponse)
    structured_groq = groq_llm.with_structured_output(AnalyzeResponse)

    parsed_output = None

    # --- PROSES LLM DENGAN FALLBACK YANG AMAN ---
    try:
        logger.info("Sending request to Gemini...")
        ai_response = structured_gemini.invoke(prompt)
        # Ambil data dalam bentuk dictionary dari object Pydantic
        parsed_output = ai_response.model_dump()

    except Exception as gemini_err:
        logger.warning(f"Gemini failed: {str(gemini_err)}. Falling back to Groq...")
        
        try:
            logger.info("Sending request to Groq...")
            ai_response = structured_groq.invoke(prompt)
            parsed_output = ai_response.model_dump()
        except Exception as groq_err:
            logger.error(f"Both Gemini and Groq failed. Groq error: {str(groq_err)}")
            # Jika Groq juga mati, parsed_output tetap None
    

    # --- PROSES INTEGRASI DATA & CACHING ---
    if parsed_output:

        location = parsed_output.get("location")

        coordinates = await geocode_location(location)
        
        logger.info(
            f"Location extracted: {location}"
        )

        logger.info(
            f"Coordinates: {coordinates}"
        )

        try:
            parsed_output["source_document"] = source_document

            if coordinates:
                parsed_output["latitude"] = coordinates["latitude"]
                parsed_output["longitude"] = coordinates["longitude"]
            else:
                parsed_output["latitude"] = None
                parsed_output["longitude"] = None

            redis_client.setex(
                cache_key,
                3600,
                json.dumps(parsed_output)
            )

            return parsed_output

        except Exception as e:
            logger.error(
                f"Error packing final output: {str(e)}"
            )

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