import hashlib
import json

from app.core.logger import logger
from app.core.redis_client import redis_client
from app.services.geocoding.geocode_service import extract_location
from app.services.llm.gemini_service import llm
from app.services.llm.groq_service import groq_llm
from app.services.rag.retriever import get_retriever

# Import response model Anda di sini
from app.models.response_models import AnalyzeResponse 

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
Analyze the complaint below and match it with the provided Government SOP Context.

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
        try:
            parsed_output["source_document"] = source_document
            parsed_output["location"] = location

            redis_client.setex(
                cache_key,
                3600,
                json.dumps(parsed_output)
            )
            return parsed_output
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
        "location": location
    }