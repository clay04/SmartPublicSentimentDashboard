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

BACKEND_URL = os.getenv(
    "BACKEND_URL",
    "http://backend:3000/ai/ingest"
)


async def process_ai_job(payload):
    async with httpx.AsyncClient(timeout=60) as client:

        # 1. AI Engine
        response = await client.post(
            AI_ENGINE_URL,
            json={
                "text": f"{payload.get('title')}\n{payload.get('content')}"
            }
        )

        if response.status_code != 200:
            logger.error(
                f"AI Engine Error {response.status_code}: {response.text}"
            )
            return None

        ai_result = response.json()

        final_data = {
            **payload,
            **ai_result
        }

        # 🔥 DEBUG
        logger.info(f"Sending to backend: {final_data}")

        try:
            backend_res = await client.post(
                BACKEND_URL,
                json=final_data
            )

            logger.info(f"Backend status: {backend_res.status_code}")
            logger.info(f"Backend response: {backend_res.text}")

        except Exception as e:
            logger.error(f"Backend connection error: {e}")
            return None

        if backend_res.status_code != 200:
            logger.error(
                f"Backend Error {backend_res.status_code}: {backend_res.text}"
            )
            return None

        logger.info(f"AI processed & saved: {payload.get('keyword')}")

        return final_data


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