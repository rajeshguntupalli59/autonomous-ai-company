"""
Generic agent worker. Loads an agent by folder name and starts it listening on the task queue.
Usage: python run_worker.py research-agent
"""
import asyncio
import importlib.util
import os
import sys
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

agent_folder = sys.argv[1] if len(sys.argv) > 1 else "research-agent"

# task types each agent handles
TASK_TYPES = {
    "research-agent":    ["research"],
    "pm-agent":          ["generate_prd"],
    "architect-agent":   ["generate_architecture"],
    "backend-agent":     ["build_backend"],
    "frontend-agent":    ["build_frontend"],
    "qa-agent":          ["run_qa"],
    "deployment-agent":  ["deploy"],
}

_SHARED = os.path.join(os.path.dirname(__file__), "..", "packages", "shared-tools")
if _SHARED not in sys.path:
    sys.path.insert(0, _SHARED)

from agent_runtime.task_queue import TaskQueueConsumer
from agent_runtime.agent_registry import set_status

def load_agent_module(folder):
    path = os.path.join(os.path.dirname(__file__), folder)
    if path in sys.path: sys.path.remove(path)
    sys.path.insert(0, path)
    for key in ["prompts", "tools", "agent"]:
        sys.modules.pop(key, None)
    spec = importlib.util.spec_from_file_location("agent_mod", os.path.join(path, "agent.py"))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod

async def main():
    print(f"[worker] Loading {agent_folder}...")
    mod = load_agent_module(agent_folder)
    agent = mod.create_agent()
    task_types = TASK_TYPES.get(agent_folder, [])

    consumer = TaskQueueConsumer(agent_folder)

    async def handler(task_id, task_type, payload):
        await set_status(agent_folder, "running", task_id)
        try:
            result = await agent.run(task_id, task_type, payload)
        finally:
            await set_status(agent_folder, "idle", None)
        return result

    for t in task_types:
        consumer.register(t, handler)

    await set_status(agent_folder, "idle", None)
    print(f"[worker] {agent_folder} ready — listening for: {task_types}")
    await consumer.start()

if __name__ == "__main__":
    asyncio.run(main())
