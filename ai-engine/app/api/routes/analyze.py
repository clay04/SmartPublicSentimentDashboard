from fastapi import APIRouter

from app.models.request_models import AnalyzeRequest
from app.models.response_models import AnalyzeResponse
from app.services.analysis.analyzer import analyze_text

router = APIRouter(
    prefix="/analyze",
    tags=["Analyze"]
)


@router.post("",
             response_model=AnalyzeResponse,
                summary="Analyze Public Complaint",
                description="""
            Analyze public complaints using:
            - Sentiment Analysis
            - RAG Retrieval
            - SOP Recommendation
            - Urgency Detection
            """
             )
async def analyze(payload: AnalyzeRequest):
    result = await analyze_text(payload.text)

    return result


@router.post("/batch")
async def analyze_batch(payloads: list[AnalyzeRequest]):
    results = []

    for payload in payloads:
        result = await analyze_text(payload.text)
        results.append(result)

    return {
        "results": results
    }