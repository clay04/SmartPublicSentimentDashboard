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
        try:
            logger.info(f"[STEP 1] Sending to AI Engine...")
            logger.info(f"Payload: {payload}")

            # ===============================
            # 1. CALL AI ENGINE
            # ===============================
            response = await client.post(
                AI_ENGINE_URL,
                json={
                    "text": f"{payload.get('title')}\n{payload.get('content')}"
                }
            )

            logger.info(f"AI Engine status: {response.status_code}")

            if response.status_code != 200:
                logger.error(
                    f"AI Engine Error {response.status_code}: {response.text}"
                )
                return None

            # ===============================
            # 2. PARSE RESPONSE
            # ===============================
            try:
                ai_result = response.json()
                logger.info(f"[STEP 2] AI RESULT: {ai_result}")
            except Exception as e:
                logger.exception(f"AI JSON PARSE ERROR: {e}")
                return None

            # ===============================
            # 3. MERGE DATA
            # ===============================
            try:
                final_data = {
                    **payload,
                    **ai_result
                }
                logger.info(f"[STEP 3] FINAL DATA: {final_data}")
            except Exception as e:
                logger.exception(f"MERGE ERROR: {e}")
                return None

            # ===============================
            # 4. SEND TO BACKEND
            # ===============================
            logger.info(f"[STEP 4] Sending to backend...")

            try:
                backend_res = await client.post(
                    BACKEND_URL,
                    json=final_data
                )

                logger.info(f"Backend status: {backend_res.status_code}")
                logger.info(f"Backend response: {backend_res.text}")

            except Exception as e:
                logger.exception(f"BACKEND CONNECTION ERROR: {e}")
                return None

            if backend_res.status_code != 200:
                logger.error(
                    f"Backend Error {backend_res.status_code}: {backend_res.text}"
                )
                return None

            # ===============================
            # SUCCESS
            # ===============================
            logger.info(f"✅ AI processed & saved: {payload.get('keyword')}")

            return final_data

        except Exception as e:
            logger.exception(f"🔥 UNHANDLED ERROR: {e}")
            return None


async def start_ai_worker():
    logger.info("🚀 AI Worker started")

    while True:
        try:
            logger.info("⏳ Waiting for queue...")

            result = redis_client.blpop(AI_QUEUE, timeout=5)

            # kalau queue kosong
            if result is None:
                logger.info("⚠️ Queue empty...")
                await asyncio.sleep(1)
                continue

            _, data = result
            payload = orjson.loads(data)

            logger.info(f"📥 Processing: {payload.get('title')}")

            await process_ai_job(payload)

        except Exception as e:
            logger.exception(f"🔥 AI Worker Loop Error: {e}")

        await asyncio.sleep(1)


if __name__ == "__main__":
    asyncio.run(start_ai_worker())