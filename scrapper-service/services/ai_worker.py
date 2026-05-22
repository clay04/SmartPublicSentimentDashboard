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

        logger.info(
            f"AI processed: {payload['keyword']}"
        )

        return response.json()


async def start_ai_worker():

    logger.info("AI Worker started")

    while True:

        _, data = redis_client.blpop(AI_QUEUE)

        payload = orjson.loads(data)

        logger.info(
            f"Processing: {payload['title']}"
        )

        try:

            await process_ai_job(payload)

        except Exception as e:

            logger.error(
                f"AI Worker Error: {e}"
            )

        await asyncio.sleep(1)