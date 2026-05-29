# Autonomous AI Company — Claude Code Rules

> Read BLUEPRINT.md first. Build layer by layer — never skip ahead.

---

## Project Context

Multi-agent system where AI departments (Research → PM → Architect → Engineering → QA → Deploy → Marketing → Support) build and run software products autonomously.

Stack: FastAPI · Next.js · PostgreSQL + pgvector · Redis Streams · LangGraph · Claude Sonnet 4.6

---

## Token Efficiency Rules

### 1. Read Before You Write
- Always read a file before editing it — no blind writes
- Read only the section you need: use `offset` + `limit` on large files
- Never re-read a file you just wrote

### 2. Targeted Search, Not Broad Scan
- Use Grep with a specific pattern before reading entire files
- Use Glob to locate files by pattern before reading directories
- Never `ls -R` or `find .` across the whole repo — use Glob instead

### 3. Parallel Independent Operations
- Run all independent tool calls in a single message (file reads, searches, shell commands)
- Only sequence when output of one call feeds the next

### 4. No Redundant Output
- No trailing summaries ("I have completed X" — the diff speaks for itself)
- No re-explaining code that well-named functions already explain
- No multi-line comment blocks — one short line max, only when WHY is non-obvious
- No docstrings on internal functions

### 5. Minimal Edits
- Prefer Edit over Write (sends diff, not full file)
- Change only what the task requires — no opportunistic refactoring
- No backwards-compat shims, no unused exports, no _renamed variables

### 6. Agent Prompt Token Budget (in-system rules)
When writing prompts for agents inside this project:

| Agent | Max input tokens | Max output tokens | Model |
|---|---|---|---|
| Research Agent | 8,000 | 2,000 | claude-haiku-4-5-20251001 |
| PM Agent | 6,000 | 3,000 | claude-haiku-4-5-20251001 |
| Architect Agent | 8,000 | 4,000 | claude-sonnet-4-6 |
| Backend Coding Agent | 12,000 | 6,000 | claude-sonnet-4-6 |
| Frontend Coding Agent | 10,000 | 5,000 | claude-sonnet-4-6 |
| QA Agent | 6,000 | 2,000 | claude-haiku-4-5-20251001 |
| Deployment Agent | 4,000 | 1,000 | claude-haiku-4-5-20251001 |
| Orchestrator | 10,000 | 3,000 | claude-sonnet-4-6 |

### 7. Memory Injection Rules (agent context management)
- Inject only relevant memory slices — not the entire memory store
- Use vector similarity search (pgvector) to fetch top-3 most relevant memories
- Summarize memories older than 7 days before injecting
- Never inject raw event logs — summarize first
- Cap injected memory at 2,000 tokens per agent run

### 8. Prompt Structure for Each Agent
Every agent prompt must follow this template (minimizes wasted tokens):

```
ROLE: {one sentence}
GOAL: {one sentence}
CONTEXT: {memory injection — max 2000 tokens}
TASK: {specific action}
OUTPUT FORMAT: {exact JSON schema or structure}
CONSTRAINTS: {what NOT to do}
```

### 9. Caching Strategy
- Use Anthropic prompt caching (`cache_control: ephemeral`) on:
  - System prompts (role + constraints — static per agent)
  - Shared memory context injected in every run
- Do NOT cache task-specific or dynamic content
- Target: >60% cache hit rate per agent to cut costs by ~90%

### 10. Cost Guard
- Haiku for all classification, routing, scoring, summarization tasks
- Sonnet only for code generation, architecture decisions, complex reasoning
- Never use Opus in automated agent loops — only for human-triggered analysis
- Log token usage per agent run to `agent_token_log` table for cost tracking

---

## Build Order (Enforce This)

```
Layer 0 → Skeleton        ✅ Start here
Layer 1 → Data layer      After 0
Layer 2 → Core API        After 1
Layer 3 → Memory Service  After 2 — do not rush this
Layer 4 → Event Bus       After 3
Layer 5 → Agent Runtime   After 4
Layer 6 → Research Agent  After 5 — VALIDATE before Layer 7
Layer 7 → All agents      After 6 passes E2E test
Layer 8 → Orchestrator    After 7
Layer 9 → Dashboard       Last
```

**Never work on Layer N+1 until Layer N has a passing test.**

---

## Folder Conventions

```
/services/*          → FastAPI microservices (one per domain)
/agents/*            → One folder per agent (agent.py + tools.py + prompts.py)
/packages/shared-*   → Code shared across services and agents
/apps/dashboard      → Next.js frontend (TypeScript, Tailwind)
/infrastructure      → Docker, k8s, terraform only
/scripts             → One-off utilities, migration helpers
```

- No business logic in `/apps` — only UI
- No DB queries outside `/services` — agents call service APIs, not DB directly
- Agent prompts live in `agents/{name}/prompts.py` — never hardcoded in agent.py

---

## Key Constraints

- **Claude API only** — no OpenAI keys in agent loops (use OpenAI only as fallback provider)
- **Backend Coding Agent runs in Docker sandbox** — never bare metal
- **Human approval gates** required before: deploy to production, send marketing, charge customer
- **All agent actions emit events** — nothing happens silently
- **Memory is the source of truth** — not conversation history
