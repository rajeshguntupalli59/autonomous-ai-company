import json
import os
import sys

_SHARED = os.path.join(os.path.dirname(__file__), "..", "..", "packages", "shared-tools")
if _SHARED not in sys.path:
    sys.path.insert(0, _SHARED)

from agent_runtime.base_agent import BaseAgent, AgentContext
from agent_runtime.providers.anthropic import AnthropicProvider
from agent_runtime.agent_registry import set_status
from event_bus.schemas import task_completed, agent_error
from event_bus.publisher import publish

from tools import WebSearchTool, RedditFetchTool, GitHubTrendsTool, ReadMemoryTool, WriteMemoryTool
from prompts import SYSTEM_PROMPT, TASK_PROMPT_TEMPLATE

AGENT_ID = os.getenv("RESEARCH_AGENT_ID", "research-agent")
MEMORY_URL = os.getenv("MEMORY_SERVICE_URL", "http://localhost:8001")


class ResearchAgent(BaseAgent):

    @property
    def role(self) -> str:
        return SYSTEM_PROMPT

    @property
    def max_input_tokens(self) -> int:
        return 8000

    @property
    def max_output_tokens(self) -> int:
        return 2000

    def _register_tools(self) -> None:
        self.tools.register(WebSearchTool())
        self.tools.register(RedditFetchTool())
        self.tools.register(GitHubTrendsTool())
        self.tools.register(ReadMemoryTool())
        self.tools.register(WriteMemoryTool())

    async def _build_task_prompt(self, ctx: AgentContext) -> str:
        query = ctx.payload.get("query", "find SaaS opportunities")
        return TASK_PROMPT_TEMPLATE.format(query=query)

    async def _inject_memory(self, ctx: AgentContext) -> str:
        """Fetch past research from memory-service."""
        import httpx
        query = ctx.payload.get("query", "")
        try:
            async with httpx.AsyncClient(timeout=5) as c:
                r = await c.get(f"{MEMORY_URL}/memory/search",
                    params={"query": query, "agent_id": AGENT_ID, "top_k": 3, "inject": True})
                if r.status_code == 200:
                    return r.json().get("inject") or ""
        except Exception:
            pass
        return ""

    async def _parse_result(self, ctx: AgentContext) -> dict:
        for msg in reversed(ctx.history):
            if msg.get("role") == "assistant" and isinstance(msg.get("content"), str):
                text = msg["content"].strip()
                try:
                    return json.loads(text)
                except json.JSONDecodeError:
                    # Extract JSON block if wrapped in prose
                    start = text.find("{")
                    end = text.rfind("}") + 1
                    if start >= 0 and end > start:
                        try:
                            return json.loads(text[start:end])
                        except Exception:
                            pass
                    return {"raw_output": text, "opportunities": []}
        return {"opportunities": [], "error": "no output"}

    async def _reflect(self, ctx: AgentContext, result: dict) -> None:
        """Store result to memory and emit task.completed event."""
        import httpx
        opportunities = result.get("opportunities", [])
        summary = result.get("summary", "")

        if opportunities or summary:
            content = f"Research result for '{ctx.payload.get('query', '')}': {json.dumps(result)}"
            try:
                async with httpx.AsyncClient(timeout=10) as c:
                    await c.post(f"{MEMORY_URL}/memory",
                        json={"content": content, "agent_id": AGENT_ID,
                              "memory_type": "agent_memory", "ttl_days": 30})
            except Exception as e:
                self.log.error(f"Memory write failed: {e}", e)

        try:
            evt = task_completed(ctx.task_id, {"opportunities": len(opportunities)}, AGENT_ID)
            await publish(evt, stream="task:completed")
        except Exception as e:
            self.log.error(f"Event emit failed: {e}", e)

        await set_status(AGENT_ID, "idle", None)


def create_agent() -> ResearchAgent:
    return ResearchAgent(
        name=AGENT_ID,
        provider=AnthropicProvider(model="claude-haiku-4-5-20251001"),
    )
