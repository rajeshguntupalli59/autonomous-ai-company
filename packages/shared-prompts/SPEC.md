# Package: shared-prompts

Language: Python
Used by: all agents

## Contents

### token_budgets.py
Hard token limits enforced before every Claude API call.
```python
TOKEN_BUDGETS = {
    "research-agent":    {"input": 8000,  "output": 2000, "model": "claude-haiku-4-5-20251001"},
    "pm-agent":          {"input": 6000,  "output": 3000, "model": "claude-haiku-4-5-20251001"},
    "architect-agent":   {"input": 8000,  "output": 4000, "model": "claude-sonnet-4-6"},
    "backend-agent":     {"input": 12000, "output": 6000, "model": "claude-sonnet-4-6"},
    "frontend-agent":    {"input": 10000, "output": 5000, "model": "claude-sonnet-4-6"},
    "qa-agent":          {"input": 6000,  "output": 2000, "model": "claude-haiku-4-5-20251001"},
    "deployment-agent":  {"input": 4000,  "output": 1000, "model": "claude-haiku-4-5-20251001"},
    "orchestrator":      {"input": 10000, "output": 3000, "model": "claude-sonnet-4-6"},
}
```

### prompt_template.py
Standard prompt structure all agents must follow:
```python
PROMPT_TEMPLATE = """
ROLE: {role}
GOAL: {goal}
CONTEXT: {memory_injection}
TASK: {task}
OUTPUT FORMAT: {output_format}
CONSTRAINTS: {constraints}
"""
```

### cache_config.py
Which prompt sections get `cache_control: ephemeral`:
- System prompt (role + constraints) → always cache
- Memory injection → cache when unchanged (by content hash)
- Task content → never cache
