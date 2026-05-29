import json
import os
import redis.asyncio as aioredis

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6380/0")
REGISTRY_PREFIX = "agent:status:"
TTL = 300  # 5 min heartbeat TTL

_redis: aioredis.Redis | None = None

def _get_redis() -> aioredis.Redis:
    global _redis
    if _redis is None:
        _redis = aioredis.from_url(REDIS_URL, encoding="utf-8", decode_responses=True, protocol=2)
    return _redis

async def set_status(agent_name: str, status: str, task_id: str | None = None) -> None:
    data = json.dumps({"status": status, "task_id": task_id})
    await _get_redis().setex(f"{REGISTRY_PREFIX}{agent_name}", TTL, data)

async def get_status(agent_name: str) -> dict | None:
    val = await _get_redis().get(f"{REGISTRY_PREFIX}{agent_name}")
    return json.loads(val) if val else None

async def heartbeat(agent_name: str) -> None:
    await _get_redis().expire(f"{REGISTRY_PREFIX}{agent_name}", TTL)

async def list_agents() -> list[dict]:
    r = _get_redis()
    keys = [k async for k in r.scan_iter(f"{REGISTRY_PREFIX}*")]
    result = []
    for k in keys:
        val = await r.get(k)
        if val:
            data = json.loads(val)
            data["name"] = k.replace(REGISTRY_PREFIX, "")
            result.append(data)
    return result

async def close() -> None:
    global _redis
    if _redis:
        await _redis.aclose()
        _redis = None
