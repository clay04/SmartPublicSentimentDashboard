import asyncio
import httpx
import os
import orjson

from dotenv import load_dotenv
from services.queue_service import redis_client
from utils.logger import logger

load_dotenv()

AI_QUEUE = "ai_processing_queue"

AI_ENGINE_URL = os.getenv("AI_ENGINE_URL", "http://ai-engine:8000/analyze")
BACKEND_URL = os.getenv("BACKEND_URL", "http://backend:3000/ai/ingest")


async def process_ai_job(payload):
    async with httpx.AsyncClient(timeout=60) as client:

        # =============================
        # 🔁 RETRY AI ENGINE
        # =============================
        ai_result = None

        for i in range(5):
            try:
                response = await client.post(
                    AI_ENGINE_URL,
                    json={
                        "title": payload.get("title", ""),
                        "content": payload.get("content", ""),
                        "keyword": payload.get("keyword", ""),
                        "source": payload.get("source", "")
                    }
                )

                if response.status_code == 200:
                    ai_result = response.json()
                    logger.info(f"AI Result: {ai_result}")
                    break
                else:
                    logger.warning(f"AI retry {i+1}: {response.status_code}")

            except Exception as e:
                logger.warning(f"AI retry {i+1} failed: {e}")

            await asyncio.sleep(2)

        if not ai_result:
            logger.error("❌ AI Engine failed after retries")
            return None

        # =============================
        # 🔁 MERGE DATA
        # =============================
        final_data = {
            **payload,
            **ai_result
        }

        # =============================
        # 🔁 RETRY BACKEND
        # =============================
        for i in range(5):
            try:
                backend_res = await client.post(
                    BACKEND_URL,
                    json=final_data
                )

                if backend_res.status_code == 200:
                    logger.info(f"✅ Saved: {payload.get('keyword')}")
                    return final_data
                else:
                    logger.warning(f"Backend retry {i+1}: {backend_res.status_code}")

            except Exception as e:
                logger.warning(f"Backend retry {i+1} failed: {e}")

            await asyncio.sleep(2)

        logger.error("❌ Backend failed after retries")
        return None


async def start_ai_worker():
    logger.info("🚀 AI Worker started")
    logger.info(f"AI_ENGINE_URL: {AI_ENGINE_URL}")
    logger.info(f"BACKEND_URL: {BACKEND_URL}")
    
    await asyncio.sleep(5)
    try:
        redis_client.ping()
        logger.info("✅ Redis connected")
    except Exception as e:
        logger.error(f"❌ Redis connection failed: {e}")
        return 

    while True:
        try:
            
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None,
                lambda: redis_client.blpop(AI_QUEUE, timeout=5)
            )

            if result is None:
                continue

            _, data = result
            payload = orjson.loads(data)

            logger.info(f"📥 Processing: {payload.get('title')}")
            await process_ai_job(payload)

        except Exception as e:
            logger.error(f"AI Worker Error: {e}")

        await asyncio.sleep(1)


if __name__ == "__main__":
    while True:
        try:
            asyncio.run(start_ai_worker())
        except Exception as e:
            logger.exception(f"🔥 Worker crashed, restarting...: {e}")