import json
import logging
import os
import asyncpg

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:password@localhost:5433/autonomous_company"
)
# asyncpg uses plain postgres:// URL (no +asyncpg driver prefix)
_PG_URL = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")

logger = logging.getLogger("aic.dead_letter")

async def move_to_dead_letter(
    stream: str,
    event_id: str,
    payload: dict,
    error: str,
    attempts: int,
) -> None:
    try:
        conn = await asyncpg.connect(_PG_URL)
        await conn.execute(
            """INSERT INTO dead_letter (stream, event_id, payload, error, attempts)
               VALUES ($1, $2, $3, $4, $5)""",
            stream, event_id, json.dumps(payload), error, attempts,
        )
        await conn.close()
        logger.warning(f"Dead letter: stream={stream} event={event_id} attempts={attempts}")
    except Exception as e:
        logger.error(f"Failed to write dead letter: {e}")
