# Service: Workflow Engine

Port: 8003
Layer: 8 (alongside Orchestrator)

## Responsibility
Stores workflow definitions, tracks step-by-step state, exposes workflow progress to dashboard.

## Workflow State Machine
```
created → running → awaiting_approval → running → completed
                                      ↘ failed
                                      ↘ cancelled
```

## Endpoints
```
GET  /workflow-definitions        → list available workflow types
GET  /workflow/{id}/steps         → all steps + status for a workflow
GET  /workflow/{id}/current-step  → what's running right now
POST /workflow/{id}/checkpoint    → save state after each step
GET  /workflow/{id}/history       → full execution log
```

## Step Schema
```python
@dataclass
class WorkflowStep:
    id: str
    workflow_id: str
    name: str                 # e.g. "research", "architect"
    status: str               # pending | running | completed | failed | skipped
    agent_id: str | None
    input: dict
    output: dict | None
    started_at: str | None
    completed_at: str | None
    error: str | None
```

## Persistence
- All workflow + step state saved to postgres
- Survives server restart — workflows resume from last checkpoint
- No in-memory-only state allowed

## Key Files
```
app/
  main.py
  models/
    workflow.py
    step.py
  services/
    state_machine.py    ← transitions + validation
    checkpoint.py       ← persist step state
  routers/
    workflow.py
```
