import asyncio

from services.queue_service import get_scrape_job
from scraper.twitter_scraper import TwitterScraper
from scraper.news_scraper import NewsScraper

twitter_scraper = TwitterScraper()
news_scraper = NewsScraper()


async def start_worker():

    while True:

        job = get_scrape_job()

        keyword = job["keyword"]
        platform = job["platform"]

        if platform == "twitter":

            await twitter_scraper.scrape(keyword)

        elif platform == "news":

            await news_scraper.scrape(keyword)

        await asyncio.sleep(1)