import json, os, sys, httpx
from datetime import datetime, timezone

_SHARED = os.path.join(os.path.dirname(__file__), "..", "..", "packages", "shared-tools")
if _SHARED not in sys.path: sys.path.insert(0, _SHARED)

from agent_runtime.base_agent import BaseAgent, AgentContext
from agent_runtime.providers.anthropic import AnthropicProvider
from event_bus.schemas import deployment_done
from event_bus.publisher import publish
from base_tool import BaseTool
from file_tools import RunCommandTool
from prompts import SYSTEM_PROMPT, TASK_PROMPT

AGENT_ID = "deployment-agent"
MEMORY_URL = os.getenv("MEMORY_SERVICE_URL", "http://localhost:8001")
RAILWAY_TOKEN = os.getenv("RAILWAY_TOKEN", "")
VERCEL_TOKEN = os.getenv("VERCEL_TOKEN", "")


class RailwayDeployTool(BaseTool):
    name = "railway_deploy"
    description = "Deploy backend to Railway. Returns deployment URL."
    def input_schema(self): return {"type":"object","properties":{"project_path":{"type":"string"},"project_name":{"type":"string"}},"required":["project_path"]}
    async def run(self, input):
        if not RAILWAY_TOKEN:
            return {"url": f"https://{input.get('project_name','app')}-stub.railway.app", "_simulated": True}
        cmd_tool = RunCommandTool()
        result = await cmd_tool.run({"command": f"railway up --detach", "project": input["project_path"], "timeout": 120})
        url = _extract_url(result.get("stdout", ""), "railway.app") or f"https://{input.get('project_name','app')}.railway.app"
        return {"url": url, "exit_code": result.get("exit_code", 0)}


class VercelDeployTool(BaseTool):
    name = "vercel_deploy"
    description = "Deploy frontend to Vercel. Returns deployment URL."
    def input_schema(self): return {"type":"object","properties":{"project_path":{"type":"string"},"project_name":{"type":"string"}},"required":["project_path"]}
    async def run(self, input):
        if not VERCEL_TOKEN:
            return {"url": f"https://{input.get('project_name','app')}-stub.vercel.app", "_simulated": True}
        cmd_tool = RunCommandTool()
        result = await cmd_tool.run({"command": f"vercel --token {VERCEL_TOKEN} --yes --prod", "project": input["project_path"], "timeout": 120})
        url = _extract_url(result.get("stdout", ""), "vercel.app") or f"https://{input.get('project_name','app')}.vercel.app"
        return {"url": url, "exit_code": result.get("exit_code", 0)}


class WriteMemoryTool(BaseTool):
    name = "write_memory"
    description = "Store deployment URLs to memory."
    def input_schema(self): return {"type":"object","properties":{"content":{"type":"string"}},"required":["content"]}
    async def run(self, input):
        async with httpx.AsyncClient(timeout=10) as c:
            r = await c.post(f"{MEMORY_URL}/memory", json={"content":input["content"],"agent_id":AGENT_ID,"memory_type":"agent_memory","ttl_days":30})
            return r.json() if r.status_code == 201 else {"error": r.text}


def _extract_url(text: str, domain: str) -> str | None:
    import re
    match = re.search(rf'https://[^\s]+{re.escape(domain)}[^\s]*', text)
    return match.group(0) if match else None


class DeploymentAgent(BaseAgent):
    @property
    def role(self): return SYSTEM_PROMPT
    @property
    def max_input_tokens(self): return 4000
    @property
    def max_output_tokens(self): return 1000

    def _register_tools(self):
        self.tools.register(RailwayDeployTool())
        self.tools.register(VercelDeployTool())
        self.tools.register(WriteMemoryTool())

    async def _build_task_prompt(self, ctx: AgentContext) -> str:
        qa = json.dumps(ctx.payload.get("qa_report", ctx.payload))
        return TASK_PROMPT.format(
            qa_report=qa,
            backend_path=ctx.payload.get("backend_path", ""),
            frontend_path=ctx.payload.get("frontend_path", ""),
        )

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
        if "backend_url" in result:
            async with httpx.AsyncClient(timeout=10) as c:
                await c.post(f"{MEMORY_URL}/memory", json={"content": f"Deployment: {json.dumps(result)}", "agent_id": AGENT_ID, "memory_type": "agent_memory", "ttl_days": 30})
            try:
                evt = deployment_done(ctx.task_id, result.get("backend_url",""), result.get("frontend_url",""))
                await publish(evt, stream="deployment:done")
            except Exception: pass


def create_agent():
    return DeploymentAgent(AGENT_ID, AnthropicProvider(model="claude-haiku-4-5-20251001"))
