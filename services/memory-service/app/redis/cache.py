import os
import json
import hashlib
import redis.asyncio as aioredis

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
CACHE_TTL = 3600  # 1 hour

_pool: aioredis.Redis | None = None

def _get_redis() -> aioredis.Redis:
    global _pool
    if _pool is None:
        _pool = aioredis.from_url(REDIS_URL, encoding="utf-8", decode_responses=True)
    return _pool

async def close():
    global _pool
    if _pool:
        await _pool.aclose()
        _pool = None

def _key(query: str, agent_id: str | None, top_k: int) -> str:
    raw = f"{query}|{agent_id}|{top_k}"
    return "mem_search:" + hashlib.sha256(raw.encode()).hexdigest()[:16]

async def get_search(query: str, agent_id: str | None, top_k: int) -> list[dict] | None:
    try:
        val = await _get_redis().get(_key(query, agent_id, top_k))
        return json.loads(val) if val else None
    except Exception:
        return None

async def set_search(query: str, agent_id: str | None, top_k: int, results: list[dict]) -> None:
    try:
        serializable = [{k: str(v) for k, v in r.items()} for r in results]
        await _get_redis().setex(_key(query, agent_id, top_k), CACHE_TTL, json.dumps(serializable))
    except Exception:
        pass

async def invalidate_agent(agent_id: str) -> None:
    try:
        r = _get_redis()
        async for key in r.scan_iter("mem_search:*"):
            await r.delete(key)
    except Exception:
        pass
