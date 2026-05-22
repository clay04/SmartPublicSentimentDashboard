import asyncio
import httpx
import os
import orjson

from dotenv import load_dotenv
from services.queue_service import redis_client
from utils.logger import logger

load_dotenv()

AI_QUEUE = "ai_processing_queue"

AI_ENGINE_URL = os.getenv(
    "AI_ENGINE_URL",
    "http://ai-engine:8000/analyze"
)


async def process_ai_job(payload):
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(
            AI_ENGINE_URL,
            json=payload
        )

        if response.status_code != 200:
            logger.error(
                f"AI Engine Error {response.status_code}: {response.text}"
            )
            return None

        logger.info(f"AI processed: {payload.get('keyword')}")
        return response.json()


async def start_ai_worker():
    logger.info("AI Worker started")

    while True:
        try:
            result = redis_client.blpop(AI_QUEUE, timeout=5)

            # ⛔ kalau queue kosong
            if result is None:
                continue

            _, data = result
            payload = orjson.loads(data)

            logger.info(f"Processing: {payload.get('title')}")

            await process_ai_job(payload)

        except Exception as e:
            logger.error(f"AI Worker Error: {e}")

        await asyncio.sleep(1)

if __name__ == "__main__":
    asyncio.run(start_ai_worker())