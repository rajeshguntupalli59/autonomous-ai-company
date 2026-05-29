import json
import os
import redis.asyncio as aioredis
from .schemas import Event

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
STREAM_MAXLEN = 10_000  # keep last 10k events per stream

_pool: aioredis.Redis | None = None

def _get_redis() -> aioredis.Redis:
    global _pool
    if _pool is None:
        _pool = aioredis.from_url(REDIS_URL, encoding="utf-8", decode_responses=True, protocol=2)
    return _pool

async def publish(event: Event, stream: str | None = None) -> str:
    """Publish event to Redis Stream. Returns the stream entry ID."""
    target = stream or event.type.replace(".", ":")
    r = _get_redis()
    entry_id = await r.xadd(
        target,
        {"event": json.dumps(event.to_dict())},
        maxlen=STREAM_MAXLEN,
        approximate=True,
    )
    return entry_id

async def close() -> None:
    global _pool
    if _pool:
        await _pool.aclose()
        _pool = None
