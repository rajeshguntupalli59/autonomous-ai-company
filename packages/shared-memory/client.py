import httpx
import os
from dataclasses import dataclass

MEMORY_SERVICE_URL = os.getenv("MEMORY_SERVICE_URL", "http://localhost:8001")
MEMORY_INJECT_TOKEN_CAP = 2000

@dataclass
class Memory:
    id: str
    agent_id: str
    memory_type: str
    content: str
    similarity: float = 0.0

class MemoryClient:
    def __init__(self, base_url: str = MEMORY_SERVICE_URL):
        self._base = base_url

    async def store(self, content: str, agent_id: str, memory_type: str = "agent_memory", ttl_days: int = 30) -> str:
        async with httpx.AsyncClient() as c:
            r = await c.post(f"{self._base}/memory", json={
                "content": content, "agent_id": agent_id,
                "memory_type": memory_type, "ttl_days": ttl_days,
            })
            r.raise_for_status()
            return r.json()["id"]

    async def search(self, query: str, agent_id: str, top_k: int = 3) -> list[Memory]:
        async with httpx.AsyncClient() as c:
            r = await c.get(f"{self._base}/memory/search", params={
                "query": query, "agent_id": agent_id, "top_k": top_k,
            })
            r.raise_for_status()
            return [Memory(**m) for m in r.json()]

    async def get_all(self, agent_id: str) -> list[Memory]:
        async with httpx.AsyncClient() as c:
            r = await c.get(f"{self._base}/memory/{agent_id}")
            r.raise_for_status()
            return [Memory(**m) for m in r.json()]

    async def update(self, memory_id: str, content: str) -> Memory:
        async with httpx.AsyncClient() as c:
            r = await c.put(f"{self._base}/memory/{memory_id}", json={"content": content})
            r.raise_for_status()
            return Memory(**r.json())

    async def delete(self, memory_id: str) -> None:
        async with httpx.AsyncClient() as c:
            r = await c.delete(f"{self._base}/memory/{memory_id}")
            r.raise_for_status()

    async def inject(self, query: str, agent_id: str) -> str:
        """Fetch top-3 memories and format for prompt injection (capped at 2000 tokens)."""
        memories = await self.search(query, agent_id, top_k=3)
        if not memories:
            return ""
        lines = [f"- {m.content}" for m in memories]
        text = "\n".join(lines)
        # Rough token estimate: 1 token ≈ 4 chars
        if len(text) > MEMORY_INJECT_TOKEN_CAP * 4:
            text = text[:MEMORY_INJECT_TOKEN_CAP * 4]
        return text
