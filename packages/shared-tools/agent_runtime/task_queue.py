import asyncio
import json
import logging
import os
import redis.asyncio as aioredis

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6380/0")
TASK_STREAM = "tasks:incoming"
BLOCK_MS = 5000

logger = logging.getLogger("aic.task_queue")

class TaskQueueConsumer:
    """Pulls tasks from Redis Stream and dispatches to a registered agent."""

    def __init__(self, agent_name: str):
        self.agent_name = agent_name
        self.group = f"group:{agent_name}"
        self.consumer = f"{agent_name}:worker"
        self._redis: aioredis.Redis | None = None
        self._running = False
        self._handlers: dict = {}  # task_type -> async callable

    def _get_redis(self) -> aioredis.Redis:
        if self._redis is None:
            self._redis = aioredis.from_url(REDIS_URL, encoding="utf-8", decode_responses=True, protocol=2)
        return self._redis

    def register(self, task_type: str, handler):
        self._handlers[task_type] = handler

    async def start(self) -> None:
        r = self._get_redis()
        try:
            await r.xgroup_create(TASK_STREAM, self.group, id="0", mkstream=True)
        except aioredis.ResponseError as e:
            if "BUSYGROUP" not in str(e):
                raise

        self._running = True
        logger.info(f"TaskQueue started for {self.agent_name}, watching {TASK_STREAM}")

        while self._running:
            try:
                entries = await r.xreadgroup(
                    self.group, self.consumer,
                    {TASK_STREAM: ">"},
                    count=1, block=BLOCK_MS,
                )
                if not entries:
                    continue
                for _, messages in entries:
                    for entry_id, data in messages:
                        await self._dispatch(r, entry_id, data)
            except Exception as e:
                logger.error(f"TaskQueue error: {e}")
                await asyncio.sleep(1)

    async def stop(self) -> None:
        self._running = False
        if self._redis:
            await self._redis.aclose()

    async def _dispatch(self, r: aioredis.Redis, entry_id: str, data: dict) -> None:
        try:
            task = json.loads(data["task"])
            task_type = task.get("type", "")
            handler = self._handlers.get(task_type)

            if not handler:
                logger.warning(f"No handler for task type: {task_type}")
                await r.xack(TASK_STREAM, self.group, entry_id)
                return

            result = await handler(task["id"], task["type"], task.get("payload", {}))
            await r.xack(TASK_STREAM, self.group, entry_id)
            logger.info(f"Task {task['id']} completed by {self.agent_name}")

        except Exception as e:
            logger.error(f"Dispatch error for {entry_id}: {e}")

async def push_task(task_id: str, task_type: str, payload: dict) -> str:
    """Push a task to the incoming stream. Returns the stream entry ID."""
    r = aioredis.from_url(REDIS_URL, encoding="utf-8", decode_responses=True, protocol=2)
    try:
        entry_id = await r.xadd(
            TASK_STREAM,
            {"task": json.dumps({"id": task_id, "type": task_type, "payload": payload})},
            maxlen=5000, approximate=True,
        )
        return entry_id
    finally:
        await r.aclose()
