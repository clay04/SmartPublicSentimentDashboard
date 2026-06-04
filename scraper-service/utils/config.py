import os

from dotenv import load_dotenv

load_dotenv()


class Config:

    AI_ENGINE_URL = os.getenv(
        "AI_ENGINE_URL",
        "http://localhost:8000/analyze"
    )

    SCRAPE_INTERVAL = int(
        os.getenv("SCRAPE_INTERVAL", 10)
    )

    ENABLE_PROXY = os.getenv(
        "ENABLE_PROXY",
        "false"
    ).lower() == "true"

    REDIS_HOST = os.getenv(
        "REDIS_HOST",
        "localhost"
    )

    REDIS_PORT = int(
        os.getenv("REDIS_PORT", 6379)
    )


config = Config()