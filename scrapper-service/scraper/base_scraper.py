from abc import ABC, abstractmethod

class BaseScraper(ABC):

    @abstractmethod
    async def scrape(self, keyword: str):
        pass