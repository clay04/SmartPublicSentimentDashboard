from rq import Queue

from app.core.redis_client import redis_client

queue = Queue(
    "ai-analysis",
    connection=redis_client
)