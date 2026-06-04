import asyncio

from services.scheduler import start_scheduler


async def main():
    start_scheduler()

    await asyncio.Event().wait()


if __name__ == "__main__":
    asyncio.run(main())