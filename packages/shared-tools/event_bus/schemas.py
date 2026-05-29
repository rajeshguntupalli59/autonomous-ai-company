import uuid
from datetime import datetime, timezone
from dataclasses import dataclass, field, asdict
from typing import Literal

EventType = Literal[
    "task.created", "task.completed", "task.failed",
    "agent.started", "agent.completed", "agent.error",
    "memory.updated",
    "deployment.started", "deployment.done", "deployment.failed",
    "workflow.step.started", "workflow.step.completed", "workflow.completed",
]

@dataclass
class Event:
    type: str
    source: str
    payload: dict
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def to_dict(self) -> dict:
        return asdict(self)

    @classmethod
    def from_dict(cls, d: dict) -> "Event":
        return cls(
            id=d["id"],
            type=d["type"],
            source=d["source"],
            payload=d.get("payload", {}),
            timestamp=d.get("timestamp", ""),
        )

# ── Payload helpers (typed constructors) ──────────────────────────────────────

def task_created(task_id: str, task_type: str, payload: dict, source: str) -> Event:
    return Event(type="task.created", source=source,
                 payload={"task_id": task_id, "type": task_type, "payload": payload})

def task_completed(task_id: str, result: dict, source: str) -> Event:
    return Event(type="task.completed", source=source,
                 payload={"task_id": task_id, "result": result})

def task_failed(task_id: str, error: str, retries: int, source: str) -> Event:
    return Event(type="task.failed", source=source,
                 payload={"task_id": task_id, "error": error, "retries": retries})

def agent_started(agent_id: str, task_id: str) -> Event:
    return Event(type="agent.started", source=agent_id,
                 payload={"agent_id": agent_id, "task_id": task_id})

def agent_completed(agent_id: str, task_id: str, output: dict) -> Event:
    return Event(type="agent.completed", source=agent_id,
                 payload={"agent_id": agent_id, "task_id": task_id, "output": output})

def agent_error(agent_id: str, task_id: str, error: str) -> Event:
    return Event(type="agent.error", source=agent_id,
                 payload={"agent_id": agent_id, "task_id": task_id, "error": error})

def deployment_done(project_id: str, backend_url: str, frontend_url: str) -> Event:
    return Event(type="deployment.done", source="deployment-agent",
                 payload={"project_id": project_id, "backend_url": backend_url, "frontend_url": frontend_url})

def workflow_completed(workflow_id: str, result: dict) -> Event:
    return Event(type="workflow.completed", source="orchestrator",
                 payload={"workflow_id": workflow_id, "result": result})
