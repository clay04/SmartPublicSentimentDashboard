import asyncio
import httpx
import os
import orjson

from dotenv import load_dotenv
from services.queue_service import redis_client
from utils.logger import logger

load_dotenv()

AI_QUEUE = "ai_processing_queue"
DLQ_NAME = "ai_processing_dlq"
AI_ENGINE_BATCH_URL = os.getenv("AI_ENGINE_BATCH_URL", "http://ai-engine:8000/analyze/batch")
BACKEND_URL = os.getenv("BACKEND_URL", "http://backend:3000/ai/ingest-bulk")

BATCH_SIZE = 25


def push_to_dlq(items: list[dict]):
    """Menyimpan data yang gagal diproses ke Dead Letter Queue (DLQ)."""
    try:
        for item in items:
            redis_client.rpush(DLQ_NAME, orjson.dumps(item))
        logger.warning(f"⚠️ Pushed {len(items)} failed item(s) to DLQ ({DLQ_NAME})")
    except Exception as e:
        logger.error(f"❌ Failed to push items to DLQ: {e}")


def fetch_batch_from_redis(batch_size: int = 25) -> list[dict]:
    first = redis_client.blpop(AI_QUEUE, timeout=5)
    if not first:
        return []

    items = [orjson.loads(first[1])]
    needed = batch_size - 1

    if needed > 0:
        try:
            raw_items = redis_client.lpop(AI_QUEUE, count=needed)
            if raw_items:
                if isinstance(raw_items, list):
                    for raw in raw_items:
                        items.append(orjson.loads(raw))
                else:
                    items.append(orjson.loads(raw_items))
        except Exception:
            for _ in range(needed):
                raw = redis_client.lpop(AI_QUEUE)
                if not raw:
                    break
                items.append(orjson.loads(raw))

    return items


async def process_ai_batch_job(payloads: list[dict]):
    if not payloads:
        return

    async with httpx.AsyncClient(timeout=180) as client:
        ai_request_body = [
            {
                "title": p.get("title", ""),
                "content": (p.get("content", "") or "")[:3000],
                "keyword": p.get("keyword", ""),
                "source": p.get("source", "")
            }
            for p in payloads
        ]

        ai_results = None

        # 1. Kirim Batch Request ke AI Engine
        for i in range(5):
            try:
                response = await client.post(
                    AI_ENGINE_BATCH_URL,
                    json=ai_request_body
                )

                if response.status_code == 200:
                    ai_results = response.json()
                    logger.info(f"✅ AI Batch success: {len(ai_results)} items processed")
                    break
                else:
                    logger.warning(f"AI Batch retry {i+1}: {response.status_code}")

            except Exception as e:
                logger.warning(f"AI Batch retry {i+1} failed: {e}")

            await asyncio.sleep(2)

        # Jika AI Engine gagal total -> Pindahkan seluruh batch awal ke DLQ
        if not ai_results or len(ai_results) != len(payloads):
            logger.error("❌ AI Engine batch processing failed. Moving entire batch to DLQ.")
            push_to_dlq(payloads)
            return

        # 2. Gabungkan payload asli dengan hasil analisis AI
        final_data_list = [
            {**original, **result}
            for original, result in zip(payloads, ai_results)
        ]

        # 3. 🔥 Kirim sekaligus ke Backend via Bulk Ingest (1 HTTP Request)
        for i in range(5):
            try:
                backend_res = await client.post(BACKEND_URL, json=final_data_list)
                if backend_res.status_code in (200, 201, 207):
                    logger.info(f"✅ Saved batch of {len(final_data_list)} items to Backend")
                    return
                else:
                    logger.warning(f"Backend bulk retry {i+1}: {backend_res.status_code}")
            except Exception as e:
                logger.warning(f"Backend bulk retry {i+1} failed: {e}")

            await asyncio.sleep(2)

        # Jika Backend gagal total 5x retry -> Pindahkan seluruh data hasil AI ke DLQ
        logger.error(f"❌ Backend bulk failed after retries. Moving {len(final_data_list)} items to DLQ.")
        push_to_dlq(final_data_list)


async def start_ai_worker():
    logger.info("🚀 AI Batch Worker started")
    logger.info(f"AI_ENGINE_BATCH_URL: {AI_ENGINE_BATCH_URL}")
    logger.info(f"BACKEND_URL: {BACKEND_URL}")

    while True:
        try:
            redis_client.ping()
            logger.info("✅ Redis connected")
            break
        except Exception as e:
            logger.error(f"❌ Redis connection failed: {e}")
            await asyncio.sleep(3)

    while True:
        try:
            loop = asyncio.get_running_loop()

            payloads = await loop.run_in_executor(
                None,
                lambda: fetch_batch_from_redis(BATCH_SIZE)
            )

            if not payloads:
                continue

            logger.info(f"📥 Processing batch of {len(payloads)} complaints")
            await process_ai_batch_job(payloads)

        except Exception as e:
            logger.exception(f"🔥 AI Worker Error: {e}")

        await asyncio.sleep(0.5)


if __name__ == "__main__":
    try:
        asyncio.run(start_ai_worker())
    except Exception as e:
        logger.exception(f"🔥 Worker crashed: {e}")