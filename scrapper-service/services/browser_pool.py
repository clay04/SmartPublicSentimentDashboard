from playwright.async_api import async_playwright

class BrowserPool:

    playwright = None
    browser = None

    @classmethod
    async def initialize(cls):

        if cls.browser:
            return

        cls.playwright = await async_playwright().start()

        cls.browser = await cls.playwright.chromium.launch(
            headless=True
        )

    @classmethod
    async def get_page(cls):

        if not cls.browser:
            await cls.initialize()

        return await cls.browser.new_page()

    @classmethod
    async def shutdown(cls):

        if cls.browser:
            await cls.browser.close()

        if cls.playwright:
            await cls.playwright.stop()