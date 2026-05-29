"""
ExecutiveOrchestrator — event-driven workflow engine.

Flow:
  POST /workflow/start  -> creates WorkflowRun, pushes first task
  task.completed event  -> advance to next step (or gate)
  POST /approve         -> release human gate, push deploy task
"""
import asyncio
import json
import logging
import os
import uuid

import redis.asyncio as aioredis
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import AsyncSessionLocal
from app.db.models.workflow import WorkflowRun
from app.workflows.product_creation import STEPS, get_step, next_step

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6380/0")
TASK_STREAM = "tasks:incoming"
COMPLETED_STREAM = "task:completed"
CONSUMER_GROUP = "orchestrator"
CONSUMER_NAME = "orchestrator-worker"
BLOCK_MS = 5000
MAX_RETRIES = 3

logger = logging.getLogger("aic.orchestrator")


class ExecutiveOrchestrator:
    def __init__(self):
        self._redis: aioredis.Redis | None = None
        self._running = False

    def _get_redis(self) -> aioredis.Redis:
        if self._redis is None:
            self._redis = aioredis.from_url(
                REDIS_URL, encoding="utf-8", decode_responses=True, protocol=2
            )
        return self._redis

    # ── Public API ─────────────────────────────────────────────────────────────

    async def start_workflow(self, goal: str, workflow_type: str = "product_creation") -> str:
        """Create a WorkflowRun and push the first task. Returns workflow ID."""
        workflow_id = str(uuid.uuid4())
        step_records = [{"name": s["name"], "status": "pending", "result": None} for s in STEPS]

        async with AsyncSessionLocal() as db:
            run = WorkflowRun(
                id=uuid.UUID(workflow_id),
                name=workflow_type,
                goal=goal,
                status="running",
                current_step=STEPS[0]["name"],
                steps=step_records,
                context={},
            )
            db.add(run)
            await db.commit()

        first_payload = STEPS[0]["build_payload"](goal, {})
        await self._push_step(workflow_id, STEPS[0], goal, first_payload)
        logger.info(f"Workflow {workflow_id} started: {goal}")
        return workflow_id

    async def approve(self, workflow_id: str) -> bool:
        """Release the human gate and push the deploy task."""
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(WorkflowRun).where(WorkflowRun.id == uuid.UUID(workflow_id))
            )
            run = result.scalar_one_or_none()
            if not run or run.status != "awaiting_approval":
                return False
            run.status = "running"
            await db.commit()

        deploy_step = get_step("deploy")
        if deploy_step:
            async with AsyncSessionLocal() as db:
                result = await db.execute(select(WorkflowRun).where(WorkflowRun.id == uuid.UUID(workflow_id)))
                run = result.scalar_one_or_none()
                if run:
                    payload = deploy_step["build_payload"](run.goal, run.context)
                    await self._push_step(workflow_id, deploy_step, run.goal, payload)
        return True

    async def cancel(self, workflow_id: str) -> bool:
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                update(WorkflowRun)
                .where(WorkflowRun.id == uuid.UUID(workflow_id))
                .values(status="cancelled")
            )
            await db.commit()
            return result.rowcount > 0

    # ── Event loop ─────────────────────────────────────────────────────────────

    async def run_event_loop(self):
        """Consume task.completed events and advance workflows."""
        r = self._get_redis()
        try:
            await r.xgroup_create(COMPLETED_STREAM, CONSUMER_GROUP, id="0", mkstream=True)
        except aioredis.ResponseError as e:
            if "BUSYGROUP" not in str(e):
                raise

        self._running = True
        logger.info("Orchestrator event loop started")

        while self._running:
            try:
                entries = await r.xreadgroup(
                    CONSUMER_GROUP, CONSUMER_NAME,
                    {COMPLETED_STREAM: ">"},
                    count=10, block=BLOCK_MS,
                )
                if not entries:
                    continue
                for _, messages in entries:
                    for entry_id, data in messages:
                        await self._on_task_completed(data)
                        await r.xack(COMPLETED_STREAM, CONSUMER_GROUP, entry_id)
            except Exception as e:
                logger.error(f"Orchestrator event loop error: {e}")
                await asyncio.sleep(1)

    async def stop(self):
        self._running = False
        if self._redis:
            await self._redis.aclose()

    # ── Internal ───────────────────────────────────────────────────────────────

    async def _on_task_completed(self, data: dict):
        try:
            event = json.loads(data["event"])
            payload = event.get("payload", {})
            task_id = payload.get("task_id", "")

            # task_id format: {workflow_id}:{step_name}:{uuid}
            if ":" not in task_id:
                return
            parts = task_id.split(":", 2)
            if len(parts) < 2:
                return
            workflow_id, step_name = parts[0], parts[1]

            await self._advance(workflow_id, step_name, payload)
        except Exception as e:
            logger.error(f"on_task_completed error: {e}")

    async def _advance(self, workflow_id: str, completed_step: str, result: dict):
        async with AsyncSessionLocal() as db:
            res = await db.execute(select(WorkflowRun).where(WorkflowRun.id == uuid.UUID(workflow_id)))
            run = res.scalar_one_or_none()
            if not run or run.status not in ("running",):
                return

            # Record step result in context
            ctx = dict(run.context)
            ctx[completed_step] = result
            steps = list(run.steps)
            for s in steps:
                if s["name"] == completed_step:
                    s["status"] = "completed"
                    s["result"] = result

            nxt = next_step(completed_step)

            if nxt is None:
                run.status = "completed"
                run.context = ctx
                run.steps = steps
                run.current_step = None
                await db.commit()
                logger.info(f"Workflow {workflow_id} COMPLETED")
                return

            if nxt.get("requires_approval"):
                run.status = "awaiting_approval"
                run.context = ctx
                run.steps = steps
                run.current_step = nxt["name"]
                await db.commit()
                logger.info(f"Workflow {workflow_id} awaiting human approval before: {nxt['name']}")
                return

            run.context = ctx
            run.steps = steps
            run.current_step = nxt["name"]
            await db.commit()

        await self._push_step(workflow_id, nxt, run.goal, nxt["build_payload"](run.goal, ctx))

    async def _push_step(self, workflow_id: str, step: dict, goal: str, payload: dict):
        task_id = f"{workflow_id}:{step['name']}:{uuid.uuid4()}"
        r = self._get_redis()
        task = {"id": task_id, "type": step["task_type"], "payload": payload}
        await r.xadd(
            TASK_STREAM,
            {"task": json.dumps(task)},
            maxlen=5000, approximate=True,
        )
        logger.info(f"Pushed step '{step['name']}' task_id={task_id}")
