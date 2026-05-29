from fastapi import APIRouter
from sqlalchemy import text
from app.db.base import AsyncSessionLocal
from app.redis.client import redis_ping

router = APIRouter(tags=["health"])

@router.get("/health")
async def health():
    return {"status": "ok"}

@router.get("/ready")
async def ready():
    errors = []
    try:
        async with AsyncSessionLocal() as s:
            await s.execute(text("SELECT 1"))
    except Exception as e:
        errors.append(f"postgres: {e}")

    if not await redis_ping():
        errors.append("redis: unreachable")

    if errors:
        return {"status": "not_ready", "errors": errors}, 503
    return {"status": "ready", "postgres": "ok", "redis": "ok"}
