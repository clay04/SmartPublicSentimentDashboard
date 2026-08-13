import hashlib
import json
import os
from services.queue_service import redis_client

DEFAULT_TTL = 14 * 24 * 60 * 60


def is_duplicate(text: str, ttl: int = DEFAULT_TTL) -> bool:
    if not text:
        return False

    hash_id = hashlib.md5(text.encode("utf-8")).hexdigest()
    redis_key = f"seen:{hash_id}"

    is_new = redis_client.set(redis_key, "1", nx=True, ex=ttl)

    return not is_new