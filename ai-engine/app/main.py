from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.routes.analyze import router as analyze_router
from app.core.logger import logger
from app.services.rag.ingest import ensure_vector_store


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting AI Engine")

    await ensure_vector_store()

    logger.info("AI Engine Ready")

    yield

    logger.info("Shutting down AI Engine")


app = FastAPI(
    title="Smart Gov AI Engine",
    version="1.0.0",
    lifespan=lifespan,
    openapi_tags=[
        {
            "name": "Analyze",
            "description": "AI sentiment analysis endpoints"
        }
    ],
    description="""
    ## AI Engine for Smart Public Sentiment Dashboard

    AI Engine bertugas untuk:

    - Sentiment Analysis
    - Complaint Classification
    - Urgency Scoring
    - RAG-based Regulation Retrieval
    - SOP Recommendation Generation
    - Geocoding Preparation

    ### AI Stack
    - FastAPI
    - LangChain
    - Gemini 2.5 Flash
    - Groq Llama 3
    - FAISS Vector Store
    - Redis Queue

    ### Workflow

    ```text
    Scraper Service
    ↓
    Redis Queue
    ↓
    AI Engine
    ↓
    RAG + LLM
    ↓
    Structured JSON 
    """
)

app.include_router(analyze_router)


@app.get("/")
def root():
    return {
        "message": "AI Engine Running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }