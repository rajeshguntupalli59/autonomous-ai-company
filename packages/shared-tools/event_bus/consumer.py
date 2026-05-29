import asyncio
import json
import logging
import os
from typing import Callable, Awaitable
import redis.asyncio as aioredis
from .schemas import Event
from .dead_letter import move_to_dead_letter

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
MAX_RETRIES = 3
BLOCK_MS = 5000  # block up to 5s waiting for new messages

logger = logging.getLogger("aic.event_bus")

class EventConsumer:
    def __init__(self, stream: str, group: str, consumer: str):
        self.stream = stream
        self.group = group
        self.consumer = consumer
        self._redis: aioredis.Redis | None = None
        self._running = False

    def _get_redis(self) -> aioredis.Redis:
        if self._redis is None:
            self._redis = aioredis.from_url(REDIS_URL, encoding="utf-8", decode_responses=True, protocol=2)
        return self._redis

    async def _ensure_group(self) -> None:
        try:
            await self._get_redis().xgroup_create(
                self.stream, self.group, id="0", mkstream=True
            )
        except aioredis.ResponseError as e:
            if "BUSYGROUP" not in str(e):
                raise

    async def start(self, handler: Callable[[Event], Awaitable[None]]) -> None:
        await self._ensure_group()
        self._running = True
        # First drain pending messages from previous crash
        await self._process_pending(handler)
        # Then consume new messages
        while self._running:
            try:
                await self._read_new(handler)
            except Exception as e:
                logger.error(f"Consumer error on {self.stream}: {e}")
                await asyncio.sleep(1)

    async def stop(self) -> None:
        self._running = False
        if self._redis:
            await self._redis.aclose()

    async def _read_new(self, handler: Callable[[Event], Awaitable[None]]) -> None:
        r = self._get_redis()
        entries = await r.xreadgroup(
            self.group, self.consumer,
            {self.stream: ">"},
            count=10, block=BLOCK_MS,
        )
        if not entries:
            return
        for _, messages in entries:
            for entry_id, data in messages:
                await self._handle(r, entry_id, data, handler)

    async def _process_pending(self, handler: Callable[[Event], Awaitable[None]]) -> None:
        r = self._get_redis()
        pending = await r.xpending_range(self.stream, self.group, "-", "+", count=100)
        for p in pending:
            entry_id = p["message_id"]
            msgs = await r.xrange(self.stream, min=entry_id, max=entry_id)
            if msgs:
                _, data = msgs[0]
                await self._handle(r, entry_id, data, handler, delivery_count=p["times_delivered"])

    async def _handle(
        self,
        r: aioredis.Redis,
        entry_id: str,
        data: dict,
        handler: Callable[[Event], Awaitable[None]],
        delivery_count: int = 1,
    ) -> None:
        try:
            event = Event.from_dict(json.loads(data["event"]))
            await handler(event)
            await r.xack(self.stream, self.group, entry_id)
        except Exception as e:
            logger.error(f"Handler failed for {entry_id}: {e}")
            if delivery_count >= MAX_RETRIES:
                await move_to_dead_letter(self.stream, entry_id, data, str(e), delivery_count)
                await r.xack(self.stream, self.group, entry_id)
