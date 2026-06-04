from playwright.async_api import async_playwright

from scraper.base_scraper import BaseScraper
from services.deduplicator import is_duplicate

from utils.user_agents import get_random_user_agent
from utils.proxy_handler import get_proxy
from utils.logger import logger


class TwitterScraper(BaseScraper):

    async def scrape(self, keyword: str):

        results = []

        try:

            async with async_playwright() as p:

                browser = await p.chromium.launch(
                    headless=False,
                    slow_mo=100,
                    proxy=get_proxy()
                )

                context = await browser.new_context(
                    user_agent=get_random_user_agent()
                )

                page = await context.new_page()

                url = f"https://twitter.com/search?q={keyword}&src=typed_query"

                logger.info(f"Scraping keyword: {keyword}")

                await page.goto(
                    url,
                    wait_until="domcontentloaded",
                    timeout=60000
                )

                await page.wait_for_timeout(3000)

                logger.info(await page.title())

                await page.screenshot(
                    path="storage/twitter_debug.png"
                )

                tweets = await page.locator("article").all()

                logger.info(
                    f"Found {len(tweets)} tweets"
                )

                for tweet in tweets[:10]:

                    try:

                        text = await tweet.inner_text()

                        if not text.strip():
                            continue

                        if is_duplicate(text):
                            continue

                        results.append({
                            "source": "twitter",
                            "keyword": keyword,
                            "content": text
                        })

                    except Exception as e:

                        logger.error(
                            f"Tweet parse error: {e}"
                        )

                await browser.close()

        except Exception as e:

            logger.error(
                f"Twitter scraper failed: {e}"
            )

        return results