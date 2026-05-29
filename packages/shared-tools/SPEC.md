# Package: shared-tools

Language: Python
Used by: all agents

## Contents

### tool_registry.py
Central registry. Agents declare which tools they use. Runtime validates tool exists before agent runs.

### base_tool.py
```python
class BaseTool:
    name: str
    description: str
    async def run(input: dict) → dict
```

### event_bus/
Redis Streams publisher + consumer (see services/event-bus/SPEC.md)

### logger.py
Structured JSON logger. Every tool call logs: agent_id, tool_name, input_tokens, output_tokens, latency_ms, success.

## Rule
No tool should make direct DB queries. Tools call service APIs or external APIs only.
