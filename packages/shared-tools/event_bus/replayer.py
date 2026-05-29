import json
import logging
import os
import redis.asyncio as aioredis
from .schemas import Event

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
logger = logging.getLogger("aic.replayer")

async def replay(
    stream: str,
    start: str = "0",
    end: str = "+",
    count: int = 100,
) -> list[Event]:
    """Read events from a stream between start and end IDs."""
    r = aioredis.from_url(REDIS_URL, encoding="utf-8", decode_responses=True, protocol=2)
    try:
        entries = await r.xrange(stream, min=start, max=end, count=count)
        events = []
        for entry_id, data in entries:
            try:
                event = Event.from_dict(json.loads(data["event"]))
                events.append(event)
            except Exception as e:
                logger.warning(f"Skipping malformed entry {entry_id}: {e}")
        return events
    finally:
        await r.aclose()
