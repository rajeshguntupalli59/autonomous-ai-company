import os
from anthropic import AsyncAnthropic
from .base import ModelProvider, CompletionResult

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

class AnthropicProvider(ModelProvider):
    def __init__(self, model: str = "claude-sonnet-4-6"):
        self.model = model
        self._client = AsyncAnthropic(api_key=ANTHROPIC_API_KEY)

    async def complete(
        self,
        messages: list[dict],
        system_blocks: list[dict],
        tools: list[dict],
        max_tokens: int,
    ) -> CompletionResult:
        kwargs = dict(
            model=self.model,
            max_tokens=max_tokens,
            system=system_blocks,
            messages=messages,
        )
        if tools:
            kwargs["tools"] = tools

        response = await self._client.messages.create(**kwargs)

        content_text = ""
        tool_calls = []

        for block in response.content:
            if block.type == "text":
                content_text = block.text
            elif block.type == "tool_use":
                tool_calls.append({
                    "id": block.id,
                    "name": block.name,
                    "input": block.input,
                })

        usage = response.usage
        return CompletionResult(
            content=content_text,
            tool_calls=tool_calls,
            input_tokens=usage.input_tokens,
            output_tokens=usage.output_tokens,
            cached_tokens=getattr(usage, "cache_read_input_tokens", 0),
            stop_reason=response.stop_reason or "end_turn",
        )
