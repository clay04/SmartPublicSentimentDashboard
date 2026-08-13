from fastapi import APIRouter, HTTPException
from app.models.request_models import AnalyzeRequest
from app.models.response_models import AnalyzeResponse
from app.services.analysis.analyzer import analyze_text
from app.services.batch_processor.batch_processor import analyze_batch

router = APIRouter(
    prefix="/analyze",
    tags=["Analyze"]
)

@router.post(
    "",
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
    text = f"{payload.title}\n{payload.content}"
    result = await analyze_text(text)
    return result


@router.post(
    "/batch",
    response_model=list[AnalyzeResponse],
    summary="Analyze Batch Public Complaints"
)
async def analyze_batch_endpoint(payloads: list[AnalyzeRequest]):
    # Mencegah HTTP Timeout dengan membatasi maksimal 50 berita per request
    if len(payloads) > 50:
        raise HTTPException(
            status_code=400, 
            detail="Maksimal 50 berita per request batch untuk mencegah HTTP timeout."
        )
        
    texts = [f"{payload.title}\n{payload.content}" for payload in payloads]
    results = await analyze_batch(texts, max_concurrent=5, delay_between_requests=0.1)
    
    return results