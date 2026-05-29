import uuid
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import get_db
from app.db.models.workflow import WorkflowRun
from app.services.orchestrator import ExecutiveOrchestrator

router = APIRouter(prefix="/workflow", tags=["workflow"])

# Single orchestrator instance shared across requests
_orchestrator: ExecutiveOrchestrator | None = None

def get_orchestrator() -> ExecutiveOrchestrator:
    global _orchestrator
    if _orchestrator is None:
        _orchestrator = ExecutiveOrchestrator()
    return _orchestrator


class StartRequest(BaseModel):
    goal: str
    workflow_type: str = "product_creation"


@router.post("/start", status_code=201)
async def start_workflow(body: StartRequest):
    orch = get_orchestrator()
    workflow_id = await orch.start_workflow(body.goal, body.workflow_type)
    return {"workflow_id": workflow_id, "status": "running", "goal": body.goal}


@router.get("/{workflow_id}")
async def get_workflow(workflow_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(WorkflowRun).where(WorkflowRun.id == uuid.UUID(workflow_id))
    )
    run = result.scalar_one_or_none()
    if not run:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return {
        "id": str(run.id),
        "name": run.name,
        "goal": run.goal,
        "status": run.status,
        "current_step": run.current_step,
        "steps": run.steps,
        "created_at": run.created_at.isoformat() if run.created_at else None,
    }


@router.post("/{workflow_id}/approve")
async def approve(workflow_id: str):
    orch = get_orchestrator()
    ok = await orch.approve(workflow_id)
    if not ok:
        raise HTTPException(status_code=400, detail="Workflow not awaiting approval")
    return {"approved": True, "workflow_id": workflow_id}


@router.post("/{workflow_id}/cancel")
async def cancel(workflow_id: str):
    orch = get_orchestrator()
    ok = await orch.cancel(workflow_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return {"cancelled": True, "workflow_id": workflow_id}


@router.get("")
async def list_workflows(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(WorkflowRun).order_by(WorkflowRun.created_at.desc()).limit(20)
    )
    runs = result.scalars().all()
    return [{"id": str(r.id), "name": r.name, "goal": r.goal[:60],
             "status": r.status, "current_step": r.current_step} for r in runs]
