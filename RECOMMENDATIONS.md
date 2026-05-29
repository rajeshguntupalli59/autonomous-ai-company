# Recommendations — What to Fix Before Resuming

## Priority 1 — Fix Reliability (do this first)

### 1. Docker Compose for Everything
Right now services + workers are started as loose Windows background processes.
They die silently and don't restart.

Add all services and agents to `docker-compose.yml`:
```yaml
services:
  api-gateway:      # :8000
  memory-service:   # :8001
  orchestrator:     # :8002
  research-worker:  # python run_worker.py research-agent
  pm-worker:
  architect-worker:
  backend-worker:
  frontend-worker:
  qa-worker:
  deployment-worker:
```

One command to start everything: `docker compose up`
One command to see logs: `docker compose logs -f research-worker`

### 2. Backend Agent — Remove Shell Commands
The backend agent hangs because it tries to run `pip install` + `pytest` inside
the workflow. These shell commands are slow and unreliable.

Fix already in place in `agents/backend-agent/prompts.py` — just write files,
let QA agent handle test running.

### 3. Agent Worker Crash Recovery
Workers crash silently. Add `restart: unless-stopped` in Docker Compose and
structured logging to a file so you can see why they crashed.

---

## Priority 2 — Real API Keys

### Brave Search API (free tier)
https://brave.com/search/api/
Replace mock web search results with real market data.
`BRAVE_SEARCH_API_KEY=...` in .env

### Reddit API (free)
https://www.reddit.com/wiki/api/
Replace mock Reddit results with real developer pain point posts.
`REDDIT_CLIENT_ID=...`
`REDDIT_CLIENT_SECRET=...`

### GitHub Token (free)
https://github.com/settings/tokens
GitHub API works without a key but rate-limits at 60 req/hr.
Token raises it to 5000/hr.
`GITHUB_TOKEN=...`

---

## Priority 3 — Complete the Pipeline

### Frontend Agent
Currently writes Next.js files but never tested with real Claude end-to-end.
Test it after Backend Agent is fixed.

### QA Agent
Update to actually run `pytest` against backend-agent generated files in sandbox.
Need Python installed in sandbox environment.

### Deployment Agent  
Currently simulates Railway + Vercel deploys (no real tokens).
Add real tokens to deploy actual apps:
`RAILWAY_TOKEN=...`
`VERCEL_TOKEN=...`

---

## Priority 4 — Production Hardening

### Persistent Workflow State
Currently workflow context (research results, PRD, architecture) passes through
Redis events only. If orchestrator restarts mid-workflow, context is lost.

Fix: Store full step outputs in `workflow_runs.context` column (partially done).

### Token Cost Tracking
`token_logs` table exists but nothing writes to it yet.
Wire up the AnthropicProvider to log every call:
- agent_id, task_id, model, input_tokens, output_tokens, cached_tokens, cost_usd

### Prompt Caching
`cache_config.py` is built but not wired into AnthropicProvider.
Add `cache_control: ephemeral` to system prompts — saves ~90% on repeat runs.
See `packages/shared-prompts/cache_config.py`.

### Memory FK Constraint
`init.sql` removed FK on `memory.agent_id` — good.
But needs to be applied on every fresh container start.
Already fixed in `init.sql`, just needs `docker compose down -v && docker compose up`.

---

## Priority 5 — Dashboard

### Real-time Updates
Currently polls every 3s. Replace with Server-Sent Events (SSE) from orchestrator
for true real-time step updates without polling overhead.

### Workflow Detail Page
Shows step progress correctly. Add step result viewer — click a completed step
to see what Claude actually output (PRD, architecture, code).

### Cost Tracker
Add a "Total tokens used / estimated cost" row to workflow detail page.
Reads from `token_logs` table.

---

## Known Issues (fix before resuming)

| Issue | Location | Fix |
|---|---|---|
| Backend agent hangs on run_command | `agents/backend-agent/prompts.py` | Already fixed — skip commands |
| Workers die silently on Windows | All agents | Move to Docker Compose |
| Memory service loses FK drop on fresh container | `infrastructure/docker/init.sql` | Already fixed in init.sql |
| Ports conflict with local services | docker-compose.yml | Postgres:5433, Redis:6380 already set |
| `tool_use type` missing in history | `packages/shared-tools/agent_runtime/base_agent.py` | Already fixed |

---

## What Already Works (don't touch)

- Research Agent with real Claude Haiku ✅
- PM Agent with real Claude Haiku ✅  
- Architect Agent with real Claude Sonnet ✅
- Memory Service (vector search, Redis cache) ✅
- Event Bus (Redis Streams, DLQ, replay) ✅
- Orchestrator (workflow state machine, human gate) ✅
- Dashboard (Next.js, 3 pages) ✅
- All Layer 0-9 tests pass ✅

## Resume Command

```powershell
cd C:\Users\rajes\autonomous-ai-company
# After adding Docker Compose workers:
docker compose up
# Then open: http://localhost:3001
```
