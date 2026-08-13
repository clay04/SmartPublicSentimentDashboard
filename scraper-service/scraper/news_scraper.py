import asyncio
import feedparser
import httpx
import trafilatura
from googlenewsdecoder import new_decoderv1

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

    def _decode_url(self, google_url: str) -> str:
        """Mengurai URL terenkripsi Google News menjadi URL langsung ke situs penerbit."""
        try:
            res = new_decoderv1(google_url)
            if res.get("status") and res.get("decoded_url"):
                return res["decoded_url"]
        except Exception as e:
            logger.warning(f"Gagal mengurai URL Google News ({google_url}): {e}")
        return google_url

    async def _fetch_full_content(self, client: httpx.AsyncClient, google_url: str) -> tuple[str, str]:
        """Dekode URL Google News, lalu ambil teks artikel penuh dengan Trafilatura."""
        loop = asyncio.get_running_loop()

        # Eksekusi fungsi decoding synchronous di executor agar event loop tidak terblokir
        target_url = await loop.run_in_executor(None, self._decode_url, google_url)

        try:
            response = await client.get(target_url, timeout=10, follow_redirects=True)
            if response.status_code != 200:
                return "", target_url

            extracted_text = trafilatura.extract(
                response.text,
                include_comments=False,
                include_tables=False,
                no_fallback=False
            )
            return extracted_text or "", target_url

        except Exception as e:
            logger.warning(f"Gagal mengambil isi berita dari {target_url}: {e}")
            return "", target_url

    async def scrape(self, keyword: str):
        results = []

        try:
            async with httpx.AsyncClient(
                headers=HEADERS,
                timeout=30,
                follow_redirects=True
            ) as client:

                for template in RSS_FEEDS:
                    feed_url = template.format(keyword=keyword)
                    logger.info(f"Reading RSS: {feed_url}")

                    response = await client.get(feed_url)
                    logger.info(f"RSS Status: {response.status_code}")

                    feed = feedparser.parse(response.text)
                    entries_to_process = []

                    for entry in feed.entries:
                        title = entry.get("title", "")
                        summary = entry.get("summary", "")
                        url = entry.get("link", "")

                        content_check = f"{title} {summary}"

                        if keyword.lower() not in content_check.lower():
                            continue

                        if is_duplicate(content_check):
                            continue

                        entries_to_process.append({
                            "title": title,
                            "summary": summary,
                            "url": url
                        })

                    semaphore = asyncio.Semaphore(10)

                    async def process_entry(item):
                        async with semaphore:
                            full_text, real_url = await self._fetch_full_content(client, item["url"])

                            final_content = full_text if len(full_text) > 100 else item["summary"]

                            return {
                                "source": "news",
                                "keyword": keyword,
                                "title": item["title"],
                                "content": final_content,
                                "url": real_url
                            }

                    if entries_to_process:
                        logger.info(f"Decoding URLs and fetching articles for {len(entries_to_process)} items...")
                        results = list(await asyncio.gather(*[process_entry(item) for item in entries_to_process]))

            logger.info(f"News results: {len(results)}")

        except Exception as e:
            logger.error(f"News scraper failed: {e}")

        return results