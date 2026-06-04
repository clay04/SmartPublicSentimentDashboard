import asyncio

from services.scheduler import start_scheduler
from services.ai_worker import start_ai_worker


async def main():

    start_scheduler()

    await start_ai_worker()


if __name__ == "__main__":

    asyncio.run(main())