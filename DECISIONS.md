# Decision Log

Format: DATE | DECISION | ALTERNATIVES CONSIDERED | REASON

---

## 2026-05-29 | Use Redis Streams over Kafka
Alternatives: Kafka, RabbitMQ
Reason: Solo build — Kafka adds ops overhead with no benefit at this scale. Migrate if throughput exceeds 10K events/sec.

## 2026-05-29 | Use pgvector over Pinecone/Weaviate
Alternatives: Pinecone, Weaviate, Chroma
Reason: Already have Postgres. pgvector handles <1M vectors easily. Zero extra cost, zero extra service.

## 2026-05-29 | Use LangGraph over Temporal for orchestration
Alternatives: Temporal, Prefect, Celery
Reason: LangGraph is Python-native, stateful, integrates with LangChain tools. Temporal adds Java-style complexity. Revisit at scale.

## 2026-05-29 | Backend Coding Agent runs in Docker sandbox
Alternatives: subprocess, bare metal Python exec
Reason: Agent-generated code is untrusted. Docker gives filesystem + network isolation. Never relax this.

## 2026-05-29 | Anthropic-only for agent loops (no OpenAI in hot path)
Alternatives: OpenAI GPT-4o, Gemini
Reason: Claude Sonnet 4.6 outperforms on code generation. Haiku is cheapest at this quality level. OpenAI kept as fallback provider only.

## 2026-05-29 | Monorepo with pnpm workspaces (no Turborepo)
Alternatives: Turborepo, Nx, separate repos
Reason: Turborepo adds complexity before we have build performance problems. pnpm workspaces is sufficient for this scale.

## 2026-05-29 | Memory service as separate microservice (not embedded in api-gateway)
Alternatives: Embed memory in api-gateway, use external service
Reason: Every agent needs memory. Decoupling lets agents call memory directly without going through gateway. Also lets us scale memory independently.

---

## Template for new decisions

## YYYY-MM-DD | DECISION TITLE
Alternatives: ...
Reason: ...
