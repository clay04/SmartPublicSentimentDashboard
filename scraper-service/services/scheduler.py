import asyncio

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from scraper.news_scraper import NewsScraper

from services.keywords import KEYWORDS
from services.sender import process_batch

from utils.logger import logger


scheduler = AsyncIOScheduler()


async def scrape_job():

    logger.info("Running scraper job...")

    scraper = NewsScraper()

    all_results = []

    for keyword in KEYWORDS:

        logger.info(
            f"Scraping keyword: {keyword}"
        )

        results = await scraper.scrape(keyword)

        all_results.extend(results)

    if all_results:

        await process_batch(all_results)

        logger.info(
            f"Queued {len(all_results)} records"
        )


def start_scheduler():

    scheduler.add_job(
        scrape_job,
        "interval",
        minutes=10,
        id="scrape_job",
        max_instances=1,
        coalesce=True,
        misfire_grace_time=300
    )

    scheduler.start()

    logger.info("Scheduler started...")