import uuid
from datetime import datetime, timezone
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.embedder import embed

INJECT_TOKEN_CAP = 2000
CHARS_PER_TOKEN = 4

async def search(
    db: AsyncSession,
    query: str,
    agent_id: str | None = None,
    top_k: int = 3,
) -> list[dict]:
    query_vec = await embed(query)
    # Embed vector as literal in SQL to avoid asyncpg param/cast conflict
    vec_literal = "[" + ",".join(str(v) for v in query_vec) + "]"

    if agent_id:
        sql = text(f"""
            SELECT id::text, agent_id::text, memory_type, content,
                   expires_at::text, created_at::text,
                   1 - (embedding <=> '{vec_literal}'::vector) AS similarity
            FROM memory
            WHERE agent_id = :agent_id
              AND (expires_at IS NULL OR expires_at > NOW())
              AND embedding IS NOT NULL
            ORDER BY embedding <=> '{vec_literal}'::vector
            LIMIT :top_k
        """)
        result = await db.execute(sql, {"agent_id": uuid.UUID(agent_id), "top_k": top_k})
    else:
        sql = text(f"""
            SELECT id::text, agent_id::text, memory_type, content,
                   expires_at::text, created_at::text,
                   1 - (embedding <=> '{vec_literal}'::vector) AS similarity
            FROM memory
            WHERE (expires_at IS NULL OR expires_at > NOW())
              AND embedding IS NOT NULL
            ORDER BY embedding <=> '{vec_literal}'::vector
            LIMIT :top_k
        """)
        result = await db.execute(sql, {"top_k": top_k})

    return [dict(r) for r in result.mappings().all()]

def inject_text(memories: list[dict]) -> str:
    if not memories:
        return ""
    lines = [f"- {m['content']}" for m in memories]
    joined = "\n".join(lines)
    cap = INJECT_TOKEN_CAP * CHARS_PER_TOKEN
    return joined[:cap] if len(joined) > cap else joined
