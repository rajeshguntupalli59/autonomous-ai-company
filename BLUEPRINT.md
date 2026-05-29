# Autonomous AI Company — Engineering Blueprint

> Status: PARKED — Start after current project completes
> Reference: Autonomous AI Company Architecture Blueprint.pdf

---

## Vision

Build a fully autonomous AI-native company where specialized AI agents operate like
departments inside a real organization — researching markets, building software,
deploying products, marketing, handling customers, and optimizing revenue without
constant human execution.

---

## Architecture Overview

```
User / Founder
     ↓
Executive Orchestrator
     ↓
Multi-Agent Departments (Research → PM → Architect → Engineering → QA → Deploy → Marketing → Support)
     ↓
Shared Memory + Event Bus + Workflow Engine
     ↓
Execution Infrastructure
     ↓
Customer & Revenue Systems
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, FastAPI |
| Frontend | Next.js, React, TypeScript, Tailwind |
| Database | PostgreSQL + pgvector |
| Cache | Redis |
| Event Bus | Redis Streams (start here, Kafka later) |
| Orchestration | LangGraph or Temporal |
| Agent Frameworks | LangGraph, CrewAI |
| AI Providers | Anthropic (Claude Sonnet 4.6), OpenAI, Gemini |
| DevOps | Docker, Docker Compose, GitHub Actions |
| Deployment | Railway, Vercel |
| Monitoring | Grafana, Prometheus, Sentry |

---

## Master Build Strategy

**DO NOT build the full company first. Build in layers.**

```
Layer 0 → Project Skeleton
Layer 1 → Data Layer (PostgreSQL + pgvector + Redis)
Layer 2 → Core API (FastAPI + Auth + Logging)
Layer 3 → Shared Memory Service  ← MOST CRITICAL
Layer 4 → Event Bus
Layer 5 → Agent Runtime Engine   ← SECOND MOST CRITICAL
Layer 6 → First Agent End-to-End ← VALIDATE BEFORE MOVING ON
Layer 7 → Remaining Agents
Layer 8 → Orchestrator
Layer 9 → Dashboard
```

---

## Detailed Task Breakdown

### Layer 0 — Project Skeleton (2 days)

Everything depends on this. Do first.

**Tasks:**
- Init monorepo (pnpm workspaces — skip Turborepo for now)
- Docker Compose: PostgreSQL + Redis + pgvector
- Shared TypeScript types package
- Shared Python utils package
- .env management (.env.example, dotenv)
- GitHub repo + .gitignore

**Folder structure:**
```
/autonomous-company
  /apps
    /dashboard        ← Next.js frontend
    /landing-page
  /services
    /api-gateway
    /memory-service
    /orchestrator-service
    /workflow-engine
    /event-bus
  /agents
    /research-agent
    /pm-agent
    /architect-agent
    /frontend-agent
    /backend-agent
    /qa-agent
    /deployment-agent
  /packages
    /shared-types
    /shared-prompts
    /shared-tools
    /shared-memory
  /infrastructure
    /docker
    /kubernetes
    /terraform
  /docs
  /scripts
```

---

### Layer 1 — Data Layer (4 days)

Nothing works without this. Stabilize before moving on.

**Tasks:**
- PostgreSQL schema + Alembic migrations:
  - `agents` table
  - `tasks` table
  - `memory` table (vector column for embeddings)
  - `events` table
  - `workflows` table
- pgvector extension setup
- Redis connection pool
- Database health check endpoint

> Senior note: Get migrations RIGHT here. Changing schema while agents are running = pain.

---

### Layer 2 — Core API (3 days)

Thin skeleton only. Don't over-engineer.

**Tasks:**
- FastAPI app factory pattern
- JWT auth (login/verify only)
- RBAC middleware (admin / agent / human roles)
- Structured logging (JSON format, request IDs)
- Error handling middleware
- `/health`, `/ready` endpoints
- Docker image for API

> Senior note: Do NOT build all endpoints yet. Just auth + health. Agents will add their own routes.

---

### Layer 3 — Shared Memory Service (6 days)

**Most critical and most underestimated piece in the entire blueprint.**

**Tasks:**
- Separate FastAPI microservice for memory
- Memory types:
  - `agent_memory` (per-agent context)
  - `task_memory` (per-task state)
  - `event_memory` (what happened)
  - `knowledge_base` (long-term facts)
- Embedding pipeline (Anthropic or OpenAI embeddings)
- pgvector similarity search
- Redis cache layer (TTL-based)
- Memory CRUD API endpoints
- Memory summarization (compress old memories)

> Senior note: This is the actual hard problem. Budget 2x what you think.
> Agents without good memory = stateless chatbots.

---

### Layer 4 — Event Bus (3 days)

Use Redis Streams. Kafka is overkill for a solo start.

**Tasks:**
- Redis Streams publisher class
- Redis Streams consumer group class
- Event schema definitions (TypedDict):
  - `task.created` / `task.completed` / `task.failed`
  - `agent.started` / `agent.error` / `agent.completed`
  - `memory.updated`
  - `deployment.started` / `deployment.done`
- Dead letter queue (failed events → postgres)
- Event replay utility
- Consumer group auto-recovery

> Senior note: Define ALL event schemas upfront. Changing them mid-build breaks every consumer.

---

### Layer 5 — Agent Runtime Engine (5 days)

The reusable base every agent inherits. Get it right — every hour here saves 10 hours per agent.

**Tasks:**
- `BaseAgent` abstract class:
  - `role`, `tools`, `memory_client`, `event_client`
  - `run()` → `think()` → `act()` → `reflect()` loop
  - `tool_call()` with retry logic
  - `memory_inject()` before each run
  - `emit_event()` after each action
  - Structured logging per action
- Model abstraction layer:
  - `AnthropicProvider` (Claude Sonnet 4.6 default)
  - `OpenAIProvider`
  - Easy swap interface
- Tool registry (register / call any tool)
- Task queue consumer (pulls tasks, assigns to agents)
- Agent registry (which agents exist, their status)

> Senior note: Test the base agent with a dummy task before moving on.

---

### Layer 6 — First Agent End-to-End (4 days)

Build ONE agent fully before touching any other. Validate the whole chain.

**Build: Research Agent**

Capabilities:
- Tools: `web_search`, `reddit_fetch`, `github_trends`
- Reads memory for past research
- Scores opportunities (market size, competition, MRR estimate)
- Writes results to memory
- Emits `task.completed` event

**Integration test (success criteria):**
```
POST /tasks { type: "research", query: "find SaaS opportunity in DBA tools" }
  → Research Agent picks up task
  → runs web_search + reddit_fetch tools
  → scores results
  → stores to memory
  → emits task.completed event
  → memory query returns the scored opportunity
```

> Senior note: DO NOT proceed to Layer 7 until this full loop works.
> This is your system health test.

---

### Layer 7 — Remaining Agents (14 days)

These go faster once the runtime is proven.

**PM Agent (2-3 days)**
- Input: research result from memory
- Output: PRD + feature list + milestones → stored to memory
- Tools: `read_memory`, `write_memory`, `format_prd`

**Architect Agent (2-3 days)**
- Input: PRD from memory
- Output: DB schema + API design + folder structure → memory
- Tools: `read_memory`, `write_memory`, `generate_schema`

**Backend Coding Agent (3-4 days)**
- Input: architecture from memory
- Output: actual Python/FastAPI code files written to disk
- Tools: `read_memory`, `write_file`, `run_command`
- Run in Docker sandbox — do not run bare metal

**Frontend Coding Agent (2-3 days)**
- Input: architecture from memory
- Output: Next.js component files
- Tools: `read_memory`, `write_file`

**QA Agent (2 days)**
- Input: generated code path
- Output: test results + bug report → memory
- Tools: `run_tests`, `read_file`, `write_memory`

**Deployment Agent (2-3 days)**
- Input: code path + QA pass confirmation
- Output: deployed URL
- Tools: `docker_build`, `railway_deploy`, `vercel_deploy`

---

### Layer 8 — Orchestrator (4 days)

Wire agents into workflows. Only possible after all agents exist.

**Tasks:**
- Executive Orchestrator:
  - Receives high-level goal
  - Breaks into ordered task chain
  - Monitors task completion via events
  - Handles failures (retry / escalate)
- Product Creation Workflow:
  ```
  Research → PM → Architect → Backend → Frontend → QA → Deploy
  ```
- Workflow state persistence (postgres)
- Human approval gates (pause and wait for confirmation)

> Use LangGraph for orchestration. Temporal if you want durable execution with retries.

---

### Layer 9 — Dashboard (4 days)

Last. Useless without working agents.

**Tasks:**
- Next.js + Tailwind minimal dashboard
- Pages: Agents | Tasks | Workflows | Memory | Logs
- WebSocket → real-time agent status
- Task submission form (trigger a new workflow)
- Deployment tracker
- Tables + status badges only (no fancy charts at first)

> Do NOT build this early. A pretty UI over broken agents wastes time.

---

## Timeline (Realistic)

| Layer | What | Days |
|-------|------|------|
| 0 | Project skeleton | 2 |
| 1 | Data layer | 4 |
| 2 | Core API | 3 |
| 3 | Memory service | 6 |
| 4 | Event bus | 3 |
| 5 | Agent runtime | 5 |
| 6 | First agent E2E | 4 |
| 7 | Remaining agents | 14 |
| 8 | Orchestrator | 4 |
| 9 | Dashboard | 4 |
| **Total** | | **~49 days** |

- Solo full-time: **8-10 weeks**
- Solo part-time: **3-4 months**

---

## 4 Phases (High Level)

| Phase | Goal | Layers |
|-------|------|--------|
| Phase 1 | Core Autonomous Product Builder | 0-6 |
| Phase 2 | Revenue Automation (SEO, Ads, Sales agents) | After Phase 1 |
| Phase 3 | Autonomous Operations (Support, Analytics, Pricing) | After Phase 2 |
| Phase 4 | Self-Improving Company (RL, experimentation) | After Phase 3 |

---

## Stage 1 Success Criteria

The system is complete when it can do all of this WITHOUT manual engineering:

1. Discover a SaaS opportunity autonomously
2. Generate a PRD
3. Generate system architecture
4. Build MVP codebase
5. Run tests
6. Deploy application
7. Monitor deployment
8. Create basic landing page
9. Collect analytics
10. Store memory for future improvements

---

## 3 Things That Will Kill This Project

1. **Skipping the memory layer** — agents become stateless chatbots
2. **Building all agents before validating the runtime** — you'll rebuild each one 3x
3. **Building the dashboard before Layer 6 works** — vanity over function

---

## Key Design Principles

1. **Modular Agents** — every agent must be replaceable
2. **Shared Memory** — all agents require persistent context
3. **Event-Driven** — agents react to events, not polling
4. **Human Override** — humans can intervene anytime
5. **Continuous Learning** — agents improve from feedback
6. **Safety First** — critical operations require approval gates

---

## Claude Code Prompt Tips (When Building)

- Always use architecture-first prompts (explain before coding)
- Force multi-step thinking: "Think step-by-step. Do NOT jump to implementation."
- Require production standards in every prompt
- Force self-review: "Review as senior architect + security engineer + DevOps"
- Use milestone-based tasks (one layer at a time)
- Create PROJECT.md, ARCHITECTURE.md, DECISIONS.md and tell Claude to read them first

---

## Reference Files

- Original blueprint: `C:\Users\rajes\OneDrive\Documents\Autonomous AI Company Architecture Blueprint.pdf`
- This breakdown: `C:\Users\rajes\autonomous-ai-company\BLUEPRINT.md`
