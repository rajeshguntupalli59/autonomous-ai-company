# Service: Memory Service

Port: 8001
Layer: 3 (Most Critical)

## Responsibility
All agent memory — store, retrieve, summarize. The source of truth for agent state.

## Memory Types
| Type | Table | TTL | Description |
|---|---|---|---|
| agent_memory | memory | 30 days | Per-agent context and learned facts |
| task_memory | memory | 7 days | State scoped to a specific task |
| event_memory | memory | 3 days | What happened (compressed event log) |
| knowledge_base | memory | never | Long-term facts, product decisions |

## Endpoints
```
POST /memory              → store new memory (embeds + saves)
GET  /memory/search       → vector similarity search (top-K)
GET  /memory/{agent_id}   → get all memories for agent
PUT  /memory/{id}         → update memory content
DELETE /memory/{id}       → soft delete
POST /memory/summarize    → compress old memories for an agent
```

## Embedding Pipeline
1. Receive text content
2. Call embedding model (Anthropic or OpenAI text-embedding-3-small)
3. Store vector in pgvector column (1536 dims)
4. Cache in Redis (TTL = 1 hour) by content hash

## Injection Rule
- Agents call `GET /memory/search?query={task}&agent_id={id}&top_k=3`
- Returns top-3 most relevant memories
- Total injected tokens capped at 2,000 (service truncates if over)

## Summarization
- Triggered when agent has >20 memories older than 7 days
- Claude Haiku summarizes to 3-5 bullet points
- Old memories soft-deleted, summary stored as single new memory

## Key Files
```
app/
  main.py
  models/
    memory.py       ← SQLAlchemy model + pgvector column
  services/
    embedder.py     ← embedding API calls
    retriever.py    ← pgvector similarity search
    summarizer.py   ← Claude Haiku compression
  routers/
    memory.py       ← all /memory routes
  cache/
    redis.py        ← TTL cache layer
```

## Tests (Layer 3 done when these pass)
- Store memory → retrieve by vector search → correct doc returned
- Injection cap: search returning >2000 tokens is truncated to 2000
- Summarization: 25 old memories → compressed to 1 summary memory
- Redis cache: second identical search returns cached result
