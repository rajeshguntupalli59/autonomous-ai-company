# Agent: PM Agent (Product Manager)

Layer: 7
Model: claude-haiku-4-5-20251001
Token budget: 6,000 in / 3,000 out

## Role
Turns a research opportunity into a full PRD with features, milestones, and scope decisions.

## Tools
| Tool | Purpose |
|---|---|
| read_memory | Fetch research result from memory-service |
| write_memory | Store PRD to memory-service |
| format_prd | Validate PRD schema before writing |

## Input (from memory — research agent output)
```json
{ "opportunity": { "title": "...", "problem": "...", "score": 85 } }
```

## Output (written to memory)
```json
{
  "prd": {
    "product_name": "...",
    "one_liner": "...",
    "problem": "...",
    "solution": "...",
    "target_user": "...",
    "features": [
      { "name": "...", "priority": "P0|P1|P2", "description": "..." }
    ],
    "out_of_scope": ["..."],
    "success_metrics": ["..."],
    "milestones": [
      { "name": "...", "days": 0, "deliverable": "..." }
    ],
    "price": "$XX/mo"
  }
}
```

## Key Files
```
agents/pm-agent/
  agent.py
  tools.py
  prompts.py    ← PRD generation prompt (cached system prompt)
```
