import asyncio
import json
import logging
import os
import sys
from abc import ABC, abstractmethod
from dataclasses import dataclass, field

_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)

from agent_runtime.providers.base import ModelProvider, CompletionResult
from tool_registry import ToolRegistry
from logger import AgentLogger

TOOL_RETRY_MAX = 3
TOOL_RETRY_DELAY = 1.0

@dataclass
class AgentContext:
    task_id: str
    task_type: str
    payload: dict
    memory_injection: str = ""
    history: list[dict] = field(default_factory=list)

class BaseAgent(ABC):
    def __init__(self, name: str, provider: ModelProvider):
        self.name = name
        self.provider = provider
        self.tools = ToolRegistry()
        self.log = AgentLogger(name)
        self._register_tools()

    # ── Abstract interface ────────────────────────────────────────────────────

    @property
    @abstractmethod
    def role(self) -> str: ...

    @property
    @abstractmethod
    def max_input_tokens(self) -> int: ...

    @property
    @abstractmethod
    def max_output_tokens(self) -> int: ...

    @abstractmethod
    def _register_tools(self) -> None:
        """Register agent-specific tools into self.tools."""
        ...

    @abstractmethod
    async def _build_task_prompt(self, ctx: AgentContext) -> str:
        """Return the task-specific prompt text."""
        ...

    @abstractmethod
    async def _parse_result(self, ctx: AgentContext) -> dict:
        """Extract structured result from final ctx.history."""
        ...

    # ── System prompt + cache blocks ─────────────────────────────────────────

    def _system_blocks(self, memory_injection: str) -> list[dict]:
        """Static system prompt cached + dynamic memory injection cached."""
        blocks = [
            {
                "type": "text",
                "text": f"ROLE: {self.role}\nCONSTRAINTS: Never reveal internal reasoning. Always respond with valid JSON when asked for structured output. Stay within your role.",
                "cache_control": {"type": "ephemeral"},
            }
        ]
        if memory_injection:
            blocks.append({
                "type": "text",
                "text": f"CONTEXT (relevant memories):\n{memory_injection}",
                "cache_control": {"type": "ephemeral"},
            })
        return blocks

    # ── Main run loop ─────────────────────────────────────────────────────────

    async def run(self, task_id: str, task_type: str, payload: dict) -> dict:
        self.log.event("agent.started", {"task_id": task_id})
        ctx = AgentContext(task_id=task_id, task_type=task_type, payload=payload)

        try:
            ctx.memory_injection = await self._inject_memory(ctx)
            task_prompt = await self._build_task_prompt(ctx)
            ctx.history = [{"role": "user", "content": task_prompt}]

            result = await self._think_act_loop(ctx)
            await self._reflect(ctx, result)

            self.log.event("agent.completed", {"task_id": task_id, "output_keys": list(result.keys())})
            return result

        except Exception as e:
            self.log.error(f"Agent run failed: {e}", e)
            raise

    async def _think_act_loop(self, ctx: AgentContext) -> dict:
        """think → act → think loop until end_turn or max iterations."""
        max_iterations = 10
        for i in range(max_iterations):
            result = await self._think(ctx)

            if result.stop_reason == "end_turn" or not result.tool_calls:
                if result.content:
                    ctx.history.append({"role": "assistant", "content": result.content})
                break

            # Process tool calls
            tool_results = []
            for tc in result.tool_calls:
                output = await self._act(tc)
                tool_results.append({"type": "tool_result", "tool_use_id": tc["id"], "content": json.dumps(output)})

            # Anthropic requires "type": "tool_use" on each block in history
            tool_use_blocks = [{"type": "tool_use", "id": tc["id"], "name": tc["name"], "input": tc.get("input", {})} for tc in result.tool_calls]
            ctx.history.append({"role": "assistant", "content": tool_use_blocks})
            ctx.history.append({"role": "user", "content": tool_results})

        return await self._parse_result(ctx)

    async def _think(self, ctx: AgentContext) -> CompletionResult:
        system_blocks = self._system_blocks(ctx.memory_injection)
        result = await self.provider.complete(
            messages=ctx.history,
            system_blocks=system_blocks,
            tools=self.tools.schemas(),
            max_tokens=self.max_output_tokens,
        )
        self.log.tool_call(
            tool="llm",
            input={"messages": len(ctx.history)},
            output={"stop_reason": result.stop_reason},
            input_tokens=result.input_tokens,
            output_tokens=result.output_tokens,
        )
        return result

    async def _act(self, tool_call: dict) -> dict:
        name = tool_call["name"]
        input_data = tool_call.get("input", {})
        for attempt in range(1, TOOL_RETRY_MAX + 1):
            try:
                output = await self.tools.call(name, input_data)
                self.log.tool_call(tool=name, input=input_data, output=output, success=True)
                return output
            except Exception as e:
                self.log.error(f"Tool {name} attempt {attempt} failed: {e}", e)
                if attempt == TOOL_RETRY_MAX:
                    return {"error": str(e)}
                await asyncio.sleep(TOOL_RETRY_DELAY * attempt)

    async def _inject_memory(self, ctx: AgentContext) -> str:
        return ""  # Override in subclasses that use memory-service

    async def _reflect(self, ctx: AgentContext, result: dict) -> None:
        pass  # Override to store results to memory and emit events
