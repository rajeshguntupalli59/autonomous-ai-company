from abc import ABC, abstractmethod
from dataclasses import dataclass

@dataclass
class CompletionResult:
    content: str
    tool_calls: list[dict]       # [{ "name": str, "input": dict, "id": str }]
    input_tokens: int
    output_tokens: int
    cached_tokens: int
    stop_reason: str             # "end_turn" | "tool_use" | "max_tokens"

class ModelProvider(ABC):
    @abstractmethod
    async def complete(
        self,
        messages: list[dict],
        system_blocks: list[dict],   # pre-built with cache_control applied
        tools: list[dict],
        max_tokens: int,
    ) -> CompletionResult:
        ...
