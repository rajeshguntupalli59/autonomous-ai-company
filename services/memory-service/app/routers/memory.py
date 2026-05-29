import uuid
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.base import get_db
from app.db.models.memory import Memory
from app.services.embedder import embed
from app.services.retriever import search, inject_text
from app.services.summarizer import summarize_agent_memories
from app.redis import cache

router = APIRouter(prefix="/memory", tags=["memory"])

def _parse_uuid(val: str | None) -> uuid.UUID | None:
    if not val:
        return None
    try:
        return uuid.UUID(val)
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, val)

class StoreRequest(BaseModel):
    content: str
    agent_id: str | None = None
    memory_type: str = "agent_memory"
    ttl_days: int = 30

class UpdateRequest(BaseModel):
    content: str

@router.post("", status_code=201)
async def store(body: StoreRequest, db: AsyncSession = Depends(get_db)):
    embedding = await embed(body.content)
    expires_at = datetime.now(timezone.utc) + timedelta(days=body.ttl_days) if body.ttl_days else None
    mem = Memory(
        agent_id=_parse_uuid(body.agent_id),
        memory_type=body.memory_type,
        content=body.content,
        embedding=embedding,
        expires_at=expires_at,
    )
    db.add(mem)
    await db.commit()
    await db.refresh(mem)
    if body.agent_id:
        await cache.invalidate_agent(body.agent_id)
    return {"id": str(mem.id), "memory_type": mem.memory_type}

@router.get("/search")
async def search_memories(
    query: str,
    agent_id: str | None = None,
    top_k: int = 3,
    inject: bool = False,
    db: AsyncSession = Depends(get_db),
):
    cached = await cache.get_search(query, agent_id, top_k)
    if cached:
        return {"results": cached, "inject": inject_text(cached) if inject else None, "cached": True}

    resolved_id = str(_parse_uuid(agent_id)) if agent_id else None
    results = await search(db, query, resolved_id, top_k)
    await cache.set_search(query, agent_id, top_k, results)

    return {
        "results": results,
        "inject": inject_text(results) if inject else None,
        "cached": False,
    }

@router.get("/{agent_id}")
async def get_all(agent_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Memory).where(
            Memory.agent_id == _parse_uuid(agent_id),
            (Memory.expires_at == None) | (Memory.expires_at > datetime.now(timezone.utc))
        ).order_by(Memory.created_at.desc())
    )
    mems = result.scalars().all()
    return [{"id": str(m.id), "memory_type": m.memory_type, "content": m.content,
             "created_at": m.created_at.isoformat()} for m in mems]

@router.put("/{memory_id}")
async def update_memory(memory_id: str, body: UpdateRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Memory).where(Memory.id == uuid.UUID(memory_id)))
    mem = result.scalar_one_or_none()
    if not mem:
        raise HTTPException(status_code=404, detail="Memory not found")
    mem.content = body.content
    mem.embedding = await embed(body.content)
    await db.commit()
    return {"id": str(mem.id), "content": mem.content}

@router.delete("/{memory_id}", status_code=204)
async def delete_memory(memory_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Memory).where(Memory.id == uuid.UUID(memory_id)))
    mem = result.scalar_one_or_none()
    if not mem:
        raise HTTPException(status_code=404, detail="Memory not found")
    mem.expires_at = datetime.now(timezone.utc)
    await db.commit()

@router.post("/summarize/{agent_id}")
async def summarize(agent_id: str, db: AsyncSession = Depends(get_db)):
    return await summarize_agent_memories(db, agent_id)
