import os
from openai import AsyncOpenAI
from .base import ModelProvider, CompletionResult

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

class OpenAIProvider(ModelProvider):
    def __init__(self, model: str = "gpt-4o-mini"):
        self.model = model
        self._client = AsyncOpenAI(api_key=OPENAI_API_KEY)

    async def complete(
        self,
        messages: list[dict],
        system_blocks: list[dict],
        tools: list[dict],
        max_tokens: int,
    ) -> CompletionResult:
        system_text = " ".join(b.get("text", "") for b in system_blocks)
        full_messages = [{"role": "system", "content": system_text}] + messages

        kwargs = dict(model=self.model, max_tokens=max_tokens, messages=full_messages)
        if tools:
            kwargs["tools"] = [{"type": "function", "function": {
                "name": t["name"], "description": t["description"],
                "parameters": t.get("input_schema", {}),
            }} for t in tools]

        response = await self._client.chat.completions.create(**kwargs)
        choice = response.choices[0]
        msg = choice.message

        tool_calls = []
        if msg.tool_calls:
            import json
            for tc in msg.tool_calls:
                tool_calls.append({
                    "id": tc.id,
                    "name": tc.function.name,
                    "input": json.loads(tc.function.arguments),
                })

        usage = response.usage
        return CompletionResult(
            content=msg.content or "",
            tool_calls=tool_calls,
            input_tokens=usage.prompt_tokens,
            output_tokens=usage.completion_tokens,
            cached_tokens=0,
            stop_reason="tool_use" if tool_calls else "end_turn",
        )
