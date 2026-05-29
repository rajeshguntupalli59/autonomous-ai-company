# Package: shared-memory

Language: Python
Used by: all agents, all services

## Contents

### client.py
HTTP client for memory-service (port 8001).
```python
class MemoryClient:
    async def store(content, agent_id, memory_type, ttl_days) → memory_id
    async def search(query, agent_id, top_k=3) → list[Memory]  # max 2000 tokens total
    async def get_all(agent_id) → list[Memory]
    async def update(memory_id, content) → Memory
    async def delete(memory_id) → None
```

## Rule
Agents never query the database directly.
All memory operations go through this client → memory-service → postgres.
