from abc import ABC, abstractmethod

class BaseTool(ABC):
    name: str
    description: str

    @abstractmethod
    async def run(self, input: dict) -> dict:
        ...

    def to_claude_schema(self) -> dict:
        return {
            "name": self.name,
            "description": self.description,
            "input_schema": self.input_schema(),
        }

    def input_schema(self) -> dict:
        return {"type": "object", "properties": {}, "required": []}
