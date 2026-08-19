import asyncio
import itertools
from typing import Generic, List, TypeVar

T = TypeVar("T")


class AsyncRotator(Generic[T]):

    def __init__(self, items: List[T]):
        if not items:
            raise ValueError("Daftar item untuk rotator tidak boleh kosong")
        self._items = items
        self._cycle = itertools.cycle(items)
        self._lock = asyncio.Lock()

    async def get_next(self) -> T:
        async with self._lock:
            return next(self._cycle)