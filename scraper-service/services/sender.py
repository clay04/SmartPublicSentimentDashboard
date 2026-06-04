import orjson

from services.queue_service import redis_client
from utils.logger import logger

AI_QUEUE = "ai_processing_queue"


async def process_batch(data):

    for item in data:

        normalized_item = {
            "title": item.get("title") or item.get("headline") or "No Title",
            "content": item.get("content") or item.get("text") or "",
            "keyword": item.get("keyword", "unknown"),
            "source": item.get("source", "unknown"),
        }

        redis_client.rpush(
            AI_QUEUE,
            orjson.dumps(normalized_item)
        )

        logger.info(
            f"Queued AI job: {normalized_item['keyword']} | {normalized_item['title']}"
        )