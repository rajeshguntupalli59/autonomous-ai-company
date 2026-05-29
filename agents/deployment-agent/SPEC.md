# Agent: Deployment Agent

Layer: 7
Model: claude-haiku-4-5-20251001
Token budget: 4,000 in / 1,000 out

## Role
Deploys QA-approved code to Railway (backend) and Vercel (frontend). Returns live URLs.

## CRITICAL CONSTRAINT
Only runs after QA report has `deploy_approved: true` AND human has approved via Orchestrator gate.
Never deploy without both conditions met.

## Tools
| Tool | Purpose |
|---|---|
| read_memory | Fetch QA report + file manifests |
| railway_deploy | Deploy FastAPI backend to Railway |
| vercel_deploy | Deploy Next.js frontend to Vercel |
| write_memory | Store deployment URLs |

## Input
QA report + manifests from memory (must have `deploy_approved: true`)

## Output (written to memory + emitted in deployment.done)
```json
{
  "deployment": {
    "backend_url": "https://....railway.app",
    "frontend_url": "https://....vercel.app",
    "deployed_at": "ISO timestamp",
    "project_id": "..."
  }
}
```

## Run Loop
```
1. read_memory(qa_report) → assert deploy_approved = true
2. railway_deploy(backend_path) → backend_url
3. vercel_deploy(frontend_path) → frontend_url
4. Health check: GET {backend_url}/health → 200
5. write_memory(deployment)
6. emit deployment.done
```

## Key Files
```
agents/deployment-agent/
  agent.py
  tools.py      ← railway_deploy, vercel_deploy CLI wrappers
  prompts.py
```
