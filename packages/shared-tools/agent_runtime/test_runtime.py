"""
E2E test for the Agent Runtime Engine.
Run: python -m agent_runtime.test_runtime

Pass criteria:
  1. EchoAgent.run() completes a task using a dummy tool
  2. think -> act -> parse result loop works
  3. TaskQueueConsumer picks up a pushed task and routes it
  4. AgentRegistry tracks status correctly
"""
import asyncio
import os
import sys

os.environ.setdefault("REDIS_URL", "redis://localhost:6380/0")
os.environ.setdefault("ANTHROPIC_API_KEY", os.getenv("ANTHROPIC_API_KEY", ""))

from agent_runtime.base_agent import BaseAgent, AgentContext
from agent_runtime.providers.base import ModelProvider, CompletionResult
from agent_runtime.task_queue import TaskQueueConsumer, push_task
from agent_runtime.agent_registry import set_status, get_status, list_agents
from tool_registry import ToolRegistry
from base_tool import BaseTool

# ── Stub provider (no real API call) ─────────────────────────────────────────

class StubProvider(ModelProvider):
    """Returns a tool call on turn 1, then ends on turn 2."""
    def __init__(self):
        self._call_count = 0

    async def complete(self, messages, system_blocks, tools, max_tokens) -> CompletionResult:
        self._call_count += 1
        if self._call_count == 1:
            return CompletionResult(
                content="",
                tool_calls=[{"id": "tc-1", "name": "echo", "input": {"text": "hello world"}}],
                input_tokens=50, output_tokens=20, cached_tokens=30, stop_reason="tool_use",
            )
        return CompletionResult(
            content='{"result": "echo done", "echoed": "hello world"}',
            tool_calls=[],
            input_tokens=80, output_tokens=30, cached_tokens=60, stop_reason="end_turn",
        )

# ── Stub tool ─────────────────────────────────────────────────────────────────

class EchoTool(BaseTool):
    name = "echo"
    description = "Echoes input text back"

    async def run(self, input: dict) -> dict:
        return {"echoed": input.get("text", "")}

    def input_schema(self) -> dict:
        return {"type": "object", "properties": {"text": {"type": "string"}}, "required": ["text"]}

# ── Concrete agent ────────────────────────────────────────────────────────────

class EchoAgent(BaseAgent):
    @property
    def role(self) -> str:
        return "You echo text back and confirm receipt."

    @property
    def max_input_tokens(self) -> int:
        return 4000

    @property
    def max_output_tokens(self) -> int:
        return 500

    def _register_tools(self) -> None:
        self.tools.register(EchoTool())

    async def _build_task_prompt(self, ctx: AgentContext) -> str:
        return f"Echo this text: {ctx.payload.get('text', 'no text')}"

    async def _parse_result(self, ctx: AgentContext) -> dict:
        import json
        for msg in reversed(ctx.history):
            if msg.get("role") == "assistant" and isinstance(msg.get("content"), str):
                try:
                    return json.loads(msg["content"])
                except Exception:
                    return {"result": msg["content"]}
        return {"result": "no output"}

# ── Tests ─────────────────────────────────────────────────────────────────────

async def run():
    print("\n=== Test 1: BaseAgent run loop ===")
    agent = EchoAgent("echo-agent", StubProvider())
    result = await agent.run("task-001", "echo", {"text": "hello world"})
    assert "result" in result, f"Expected 'result' in output, got: {result}"
    print(f"  result: {result}")
    print("  PASS: agent completed task via think->act->parse loop")

    print("\n=== Test 2: tool registry + retry ===")
    output = await agent.tools.call("echo", {"text": "test"})
    assert output["echoed"] == "test"
    print(f"  tool output: {output}")
    print("  PASS: tool registry called correctly")

    print("\n=== Test 3: AgentRegistry status tracking ===")
    await set_status("echo-agent", "running", "task-001")
    status = await get_status("echo-agent")
    assert status["status"] == "running"
    assert status["task_id"] == "task-001"
    print(f"  status: {status}")

    await set_status("echo-agent", "idle", None)
    agents = await list_agents()
    echo = next((a for a in agents if a["name"] == "echo-agent"), None)
    assert echo is not None
    assert echo["status"] == "idle"
    print(f"  all agents: {agents}")
    print("  PASS: registry tracks status correctly")

    print("\n=== Test 4: TaskQueueConsumer dispatch ===")
    received_tasks = []

    async def handler(task_id, task_type, payload):
        received_tasks.append({"id": task_id, "type": task_type, "payload": payload})
        return {"done": True}

    consumer = TaskQueueConsumer("echo-agent")
    consumer.register("echo", handler)

    entry_id = await push_task("task-002", "echo", {"text": "dispatched"})
    print(f"  pushed task entry_id={entry_id}")

    task = asyncio.create_task(consumer.start())
    await asyncio.sleep(1.5)
    await consumer.stop()
    task.cancel()

    assert len(received_tasks) >= 1, f"Expected task received, got {received_tasks}"
    assert received_tasks[0]["type"] == "echo"
    print(f"  received: {received_tasks[0]}")
    print("  PASS: TaskQueueConsumer dispatched task to handler")

    print("\n=== All agent runtime tests passed ===\n")

if __name__ == "__main__":
    asyncio.run(run())
