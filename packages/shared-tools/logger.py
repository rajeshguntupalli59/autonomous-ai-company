import json
import time
import logging

logging.basicConfig(level=logging.INFO, format="%(message)s")
_log = logging.getLogger("aic")

class AgentLogger:
    def __init__(self, agent_id: str):
        self._agent = agent_id

    def tool_call(self, tool: str, input: dict, output: dict, input_tokens: int = 0, output_tokens: int = 0, latency_ms: int = 0, success: bool = True):
        _log.info(json.dumps({
            "agent_id": self._agent,
            "tool": tool,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "latency_ms": latency_ms,
            "success": success,
        }))

    def event(self, event_type: str, payload: dict = {}):
        _log.info(json.dumps({
            "agent_id": self._agent,
            "event": event_type,
            **payload,
        }))

    def error(self, msg: str, error: Exception | None = None):
        _log.error(json.dumps({
            "agent_id": self._agent,
            "error": msg,
            "detail": str(error) if error else None,
        }))
