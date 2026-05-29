# Service: Orchestrator Service

Port: 8002
Layer: 8 (build after all agents exist)

## Responsibility
Receives high-level goals, breaks them into task chains, monitors execution, handles failures.

## Core Workflow: Product Creation
```
Research → PM → Architect → Backend → Frontend → QA → Deploy
```
Each step waits for the previous step's `task.completed` event before starting next.

## Endpoints
```
POST /workflow/start      → start a workflow { goal, workflow_type }
GET  /workflow/{id}       → get workflow status + current step
POST /workflow/{id}/approve → human approves a pending gate
POST /workflow/{id}/cancel  → cancel running workflow
GET  /workflows           → list all workflows
```

## Human Approval Gates
Orchestrator pauses and waits for human approval before:
- Deploying to production
- Sending any marketing
- Charging a customer
- Deleting any data

Status = `awaiting_approval` until `POST /workflow/{id}/approve` called.

## Failure Handling
- Task fails → retry up to 3 times (exponential backoff)
- 3 failures → workflow paused, human notified
- Human can: retry | skip step | cancel workflow

## LangGraph Integration
- Each workflow = a LangGraph StateGraph
- Nodes = agents
- Edges = event-driven (on task.completed → next node)
- State persisted to postgres after each step

## Key Files
```
app/
  main.py
  workflows/
    product_creation.py   ← Research→PM→Arch→Build→QA→Deploy graph
    base_workflow.py      ← shared LangGraph setup
  services/
    task_dispatcher.py    ← pushes tasks to Redis Stream
    gate_manager.py       ← human approval gate logic
  routers/
    workflow.py
```

## Tests (Layer 8 done when this passes)
- POST /workflow/start { goal: "build a todo app" }
- Research Agent receives task, completes, emits task.completed
- PM Agent starts automatically, completes
- Architect Agent starts automatically
- Human gate fires before deploy step
- POST /workflow/{id}/approve → deploy proceeds
