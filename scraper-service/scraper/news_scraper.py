import feedparser
import httpx

from scraper.base_scraper import BaseScraper
from services.deduplicator import is_duplicate

from utils.logger import logger


RSS_FEEDS = [
    "https://news.google.com/rss/search?q={keyword}&hl=id&gl=ID&ceid=ID:id",
]


HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0 Safari/537.36"
    )
}


class NewsScraper(BaseScraper):

    async def scrape(self, keyword: str):

        results = []

        try:

            async with httpx.AsyncClient(
                headers=HEADERS,
                timeout=30,
                follow_redirects=True
            ) as client:

                for template in RSS_FEEDS:

                    feed_url = template.format(
                        keyword=keyword
                    )

                    logger.info(
                        f"Reading RSS: {feed_url}"
                    )

                    response = await client.get(feed_url)

                    logger.info(
                        f"RSS Status: {response.status_code}"
                    )

                    feed = feedparser.parse(
                        response.text
                    )

                    for entry in feed.entries:

                        title = entry.get("title", "")
                        summary = entry.get("summary", "")

                        content = f"{title} {summary}"

                        if keyword.lower() not in content.lower():
                            continue

                        if is_duplicate(content):
                            continue

                        results.append({
                            "source": "news",
                            "keyword": keyword,
                            "title": title,
                            "content": summary,
                            "url": entry.get("link")
                        })

            logger.info(
                f"News results: {len(results)}"
            )

        except Exception as e:

            logger.error(
                f"News scraper failed: {e}"
            )

        return results