# Autonomous AI Company

> Read this before any session. Then read ARCHITECTURE.md. Then read CLAUDE.md.

## What This Is

A multi-agent system where AI departments build and run software products autonomously.
A human founder sets a goal. Agents research, design, build, test, deploy, and market — no manual engineering.

## Current Status

| Layer | Name | Status |
|---|---|---|
| 0 | Project Skeleton | 🔲 Not started |
| 1 | Data Layer | 🔲 Not started |
| 2 | Core API | 🔲 Not started |
| 3 | Memory Service | 🔲 Not started |
| 4 | Event Bus | 🔲 Not started |
| 5 | Agent Runtime | 🔲 Not started |
| 6 | Research Agent E2E | 🔲 Not started |
| 7 | Remaining Agents | 🔲 Not started |
| 8 | Orchestrator | 🔲 Not started |
| 9 | Dashboard | 🔲 Not started |

Update this table as layers complete. Never start Layer N+1 before Layer N passes its test.

## Stage 1 Success Criteria

System does all of this with no human engineering:
1. Discovers a SaaS opportunity
2. Generates a PRD
3. Generates system architecture
4. Builds MVP codebase
5. Runs tests
6. Deploys the app
7. Creates a landing page
8. Collects analytics

## Key Paths

| What | Where |
|---|---|
| Blueprint | `BLUEPRINT.md` |
| Architecture decisions | `ARCHITECTURE.md` |
| Decision log | `DECISIONS.md` |
| Claude rules | `CLAUDE.md` |
| Services | `services/` |
| Agents | `agents/` |
| Shared packages | `packages/` |
| Frontend | `apps/dashboard/`, `apps/landing-page/` |
| Infrastructure | `infrastructure/` |

## Local Dev

```bash
# Start all services
docker-compose -f infrastructure/docker/docker-compose.yml up -d

# API
cd services/api-gateway && uvicorn app.main:app --reload --port 8000

# Memory service
cd services/memory-service && uvicorn app.main:app --reload --port 8001

# Dashboard
cd apps/dashboard && pnpm dev
```

## Environment

Copy `.env.example` to `.env` at project root. All services read from this.
