import orjson

from services.queue_service import redis_client
from utils.logger import logger

AI_QUEUE = "ai_processing_queue"


async def process_batch(data):

    for item in data:

        redis_client.rpush(
            AI_QUEUE,
            orjson.dumps(item)
        )

        logger.info(
            f"Queued AI job: {item['keyword']} | {item['title']}"
        )