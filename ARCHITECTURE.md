# Architecture

## System Diagram

```
Founder / Human
      │
      ▼
Executive Orchestrator  ←── Human approval gates
      │
      ▼
 Task Queue (Redis Streams)
      │
  ┌───┴────────────────────────────────────────┐
  │                                            │
Research   PM   Architect   Backend   Frontend   QA   Deploy
  Agent   Agent   Agent      Agent     Agent    Agent  Agent
  │         │        │          │         │       │      │
  └─────────┴────────┴──────────┴─────────┴───────┴──────┘
                               │
                    Shared Memory Service
                    (PostgreSQL + pgvector)
                               │
                         Redis Cache
```

## Services

| Service | Port | Responsibility |
|---|---|---|
| api-gateway | 8000 | Auth, routing, public API |
| memory-service | 8001 | Vector store, memory CRUD, summarization |
| orchestrator-service | 8002 | Workflow execution, task chaining |
| workflow-engine | 8003 | Workflow definitions, step state |
| event-bus | — | Redis Streams publisher/consumer (library, not a server) |

## Data Flow

```
Human Goal
  → Orchestrator breaks into tasks
  → Tasks pushed to Redis Stream
  → Agent consumes task
  → Agent injects memory (pgvector similarity top-3)
  → Agent calls Claude API (with prompt cache)
  → Agent uses tools (web search, write file, run command)
  → Agent writes result to memory
  → Agent emits task.completed event
  → Orchestrator picks up event, chains next task
```

## Database Schema (high level)

```sql
agents      (id, name, role, status, config)
tasks       (id, type, payload, status, agent_id, created_at)
memory      (id, agent_id, content, embedding vector(1536), created_at, expires_at)
events      (id, type, payload, source_agent, created_at)
workflows   (id, name, steps jsonb, status, current_step)
token_logs  (id, agent_id, task_id, input_tokens, output_tokens, cached_tokens, cost_usd, created_at)
```

## Key Decisions

See DECISIONS.md for full log. Short version:

| Decision | Choice | Reason |
|---|---|---|
| Orchestration | LangGraph | Stateful graph, easier than Temporal to start |
| Event bus | Redis Streams | No Kafka overhead for solo start |
| Vector DB | pgvector | Already have Postgres, avoids Pinecone cost |
| Agent framework | CrewAI + custom BaseAgent | CrewAI for multi-agent, custom for full control |
| AI provider | Anthropic primary | Claude Sonnet 4.6 for code/arch, Haiku for cheap tasks |
| Coding agent sandbox | Docker | Never run agent-generated code on bare metal |
| Auth | JWT (HS256) | Simple, no external auth provider needed |

## Token Budget Enforcement

All agent runners must check token limits before calling Claude API.
Hard limits defined in `packages/shared-prompts/token_budgets.py`.
Usage logged to `token_logs` table after every call.
Alert if daily cost > $5.

## Prompt Cache Strategy

Static per-agent (system prompt + role + constraints) → `cache_control: ephemeral`
Shared memory injection → cached when memory hasn't changed
Task-specific content → never cached

Target: >60% cache hit rate → ~90% cost reduction on repeat agent runs.
