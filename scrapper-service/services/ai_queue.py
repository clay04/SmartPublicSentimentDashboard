import json

from services.queue_service import redis_client

AI_QUEUE = "ai_queue"


def push_ai_job(data):

    redis_client.rpush(
        AI_QUEUE,
        json.dumps(data)
    )