import json, os, sys, httpx, re

_SHARED = os.path.join(os.path.dirname(__file__), "..", "..", "packages", "shared-tools")
if _SHARED not in sys.path: sys.path.insert(0, _SHARED)

from agent_runtime.base_agent import BaseAgent, AgentContext
from agent_runtime.providers.anthropic import AnthropicProvider
from event_bus.schemas import task_completed
from event_bus.publisher import publish
from base_tool import BaseTool
from file_tools import WriteFileTool, ReadFileTool, RunCommandTool
from prompts import SYSTEM_PROMPT, TASK_PROMPT

AGENT_ID = "backend-agent"
MEMORY_URL = os.getenv("MEMORY_SERVICE_URL", "http://localhost:8001")


class ReadMemoryTool(BaseTool):
    name = "read_memory"
    description = "Read architecture or context from memory."
    def input_schema(self): return {"type":"object","properties":{"query":{"type":"string"}},"required":["query"]}
    async def run(self, input):
        async with httpx.AsyncClient(timeout=10) as c:
            r = await c.get(f"{MEMORY_URL}/memory/search", params={"query":input["query"],"top_k":3})
            return r.json() if r.status_code == 200 else {"results":[]}


class WriteMemoryTool(BaseTool):
    name = "write_memory"
    description = "Store file manifest to memory."
    def input_schema(self): return {"type":"object","properties":{"content":{"type":"string"}},"required":["content"]}
    async def run(self, input):
        async with httpx.AsyncClient(timeout=10) as c:
            r = await c.post(f"{MEMORY_URL}/memory", json={"content":input["content"],"agent_id":AGENT_ID,"memory_type":"agent_memory","ttl_days":30})
            return r.json() if r.status_code == 201 else {"error": r.text}


class BackendAgent(BaseAgent):
    @property
    def role(self): return SYSTEM_PROMPT
    @property
    def max_input_tokens(self): return 12000
    @property
    def max_output_tokens(self): return 6000

    def _register_tools(self):
        self.tools.register(WriteFileTool())
        self.tools.register(ReadFileTool())
        self.tools.register(RunCommandTool())
        self.tools.register(ReadMemoryTool())
        self.tools.register(WriteMemoryTool())

    async def _build_task_prompt(self, ctx: AgentContext) -> str:
        arch = json.dumps(ctx.payload.get("architecture", ctx.payload))
        name = ctx.payload.get("project_name", "generated-app")
        return TASK_PROMPT.format(architecture=arch, project_name=name)

    async def _parse_result(self, ctx: AgentContext) -> dict:
        for msg in reversed(ctx.history):
            if msg.get("role") == "assistant" and isinstance(msg.get("content"), str):
                text = msg["content"].strip()
                try: return json.loads(text)
                except Exception:
                    s, e = text.find("{"), text.rfind("}") + 1
                    if s >= 0 and e > s:
                        try: return json.loads(text[s:e])
                        except Exception: pass
        return {"error": "no_output"}

    async def _reflect(self, ctx: AgentContext, result: dict) -> None:
        if "files" in result:
            async with httpx.AsyncClient(timeout=10) as c:
                await c.post(f"{MEMORY_URL}/memory", json={"content": f"Backend manifest: {json.dumps(result)}", "agent_id": AGENT_ID, "memory_type": "agent_memory", "ttl_days": 30})
        try:
            await publish(task_completed(ctx.task_id, {"files": len(result.get("files", []))}, AGENT_ID), stream="task:completed")
        except Exception: pass


def create_agent():
    return BackendAgent(AGENT_ID, AnthropicProvider(model="claude-sonnet-4-6"))
