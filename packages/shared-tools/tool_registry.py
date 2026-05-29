try:
    from .base_tool import BaseTool
except ImportError:
    from base_tool import BaseTool

class ToolRegistry:
    def __init__(self):
        self._tools: dict[str, BaseTool] = {}

    def register(self, tool: BaseTool) -> None:
        self._tools[tool.name] = tool

    def get(self, name: str) -> BaseTool:
        if name not in self._tools:
            raise ValueError(f"Tool not registered: {name}")
        return self._tools[name]

    def schemas(self) -> list[dict]:
        return [t.to_claude_schema() for t in self._tools.values()]

    async def call(self, name: str, input: dict) -> dict:
        return await self.get(name).run(input)
