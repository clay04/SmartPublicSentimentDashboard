import asyncio
from typing import List, Dict, Any
from app.services.analysis.analyzer import analyze_text
from app.core.logger import logger

async def _process_single_text(semaphore: asyncio.Semaphore, text: str, delay_between_requests: float = 0.1) -> Dict[str, Any]:
    async with semaphore:
        try:
            result = await analyze_text(text)
            if delay_between_requests > 0:
                await asyncio.sleep(delay_between_requests)
            return result
        except Exception as e:
            logger.error(f"Gagal memproses teks: {text[:30]}... | Error: {str(e)}")
            return {
                "sentiment": "unknown",
                "category": "unknown",
                "urgency": "unknown",
                "recommendation": f"Batch error: {str(e)}",
                "regulation_context": "",
                "source_document": None,
                "location": None,
                "latitude": None,
                "longitude": None
            }

async def analyze_batch(texts: List[str], max_concurrent: int = 5, delay_between_requests: float = 0.1) -> List[Dict[str, Any]]:
    """
    Menjalankan proses analisis secara asinkron dengan kontrol Semaphore untuk mencegah rate limit OpenRouter.
    """
    semaphore = asyncio.Semaphore(max_concurrent)
    tasks = [
        _process_single_text(semaphore, text, delay_between_requests) 
        for text in texts
    ]
    
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    clean_results = []
    for res in results:
        if isinstance(res, Exception):
            clean_results.append({
                "sentiment": "unknown",
                "category": "unknown",
                "urgency": "unknown",
                "recommendation": f"Unhandled task error: {str(res)}",
                "regulation_context": "",
                "source_document": None,
                "location": None,
                "latitude": None,
                "longitude": None
            })
        else:
            clean_results.append(res)
            
    return clean_results