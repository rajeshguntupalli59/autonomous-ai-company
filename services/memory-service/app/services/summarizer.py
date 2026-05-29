import os
from datetime import datetime, timezone, timedelta
from anthropic import AsyncAnthropic
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.memory import Memory
from app.services.embedder import embed

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
SUMMARIZE_THRESHOLD = 20  # summarize when agent has > this many old memories
OLD_DAYS = 7

async def summarize_agent_memories(db: AsyncSession, agent_id: str) -> dict:
    cutoff = datetime.now(timezone.utc) - timedelta(days=OLD_DAYS)
    result = await db.execute(
        select(Memory).where(
            Memory.agent_id == agent_id,
            Memory.created_at < cutoff,
        )
    )
    old = result.scalars().all()

    if len(old) <= SUMMARIZE_THRESHOLD:
        return {"summarized": 0, "message": "Not enough old memories to summarize"}

    combined = "\n".join(f"- {m.content}" for m in old)

    if ANTHROPIC_API_KEY:
        summary = await _claude_summarize(combined)
    else:
        summary = f"[Summary of {len(old)} memories] " + combined[:500] + "..."

    embedding = await embed(summary)

    new_mem = Memory(
        agent_id=agent_id,
        memory_type="agent_memory",
        content=summary,
        embedding=embedding,
    )
    db.add(new_mem)

    for m in old:
        m.expires_at = datetime.now(timezone.utc)

    await db.commit()
    return {"summarized": len(old), "new_memory_id": str(new_mem.id)}

async def _claude_summarize(text: str) -> str:
    client = AsyncAnthropic(api_key=ANTHROPIC_API_KEY)
    msg = await client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=500,
        messages=[{
            "role": "user",
            "content": f"Summarize these agent memories into 3-5 concise bullet points:\n\n{text}"
        }]
    )
    return msg.content[0].text
