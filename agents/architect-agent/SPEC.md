# Agent: Architect Agent

Layer: 7
Model: claude-sonnet-4-6
Token budget: 8,000 in / 4,000 out

## Role
Turns a PRD into a concrete technical architecture: DB schema, API design, folder structure, tech stack decisions.

## Tools
| Tool | Purpose |
|---|---|
| read_memory | Fetch PRD from memory-service |
| write_memory | Store architecture to memory-service |
| generate_schema | Validate SQL schema syntax |

## Input
PRD from memory (PM Agent output)

## Output (written to memory)
```json
{
  "architecture": {
    "stack": { "backend": "...", "frontend": "...", "db": "...", "cache": "..." },
    "db_schema": "CREATE TABLE ...",
    "api_routes": [
      { "method": "POST", "path": "/...", "description": "..." }
    ],
    "folder_structure": "...",
    "services": ["..."],
    "external_apis": ["..."],
    "estimated_files": 0
  }
}
```

## Key Files
```
agents/architect-agent/
  agent.py
  tools.py
  prompts.py    ← architecture prompt (cached — uses Sonnet)
```

## Note
Uses Sonnet (not Haiku) — architecture decisions require stronger reasoning.
