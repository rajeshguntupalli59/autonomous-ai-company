# Agent: Backend Coding Agent

Layer: 7
Model: claude-sonnet-4-6
Token budget: 12,000 in / 6,000 out

## Role
Writes production-quality Python/FastAPI code from architecture spec. Runs in Docker sandbox.

## CRITICAL CONSTRAINT
**Runs inside a Docker container. Never executes on bare metal.**
All `write_file` and `run_command` tool calls are scoped to `/sandbox` volume only.

## Tools
| Tool | Purpose |
|---|---|
| read_memory | Fetch architecture from memory-service |
| write_file | Write code files to /sandbox volume |
| run_command | Run commands inside Docker sandbox (pip install, pytest) |
| read_file | Read generated files for self-review |
| write_memory | Store generated file manifest to memory |

## Input
Architecture from memory (Architect Agent output)

## Output
- Code files written to `/sandbox/{project_name}/`
- File manifest written to memory:
```json
{
  "project_path": "/sandbox/{project_name}",
  "files": ["app/main.py", "app/models/user.py", "..."],
  "install_command": "pip install -r requirements.txt",
  "run_command": "uvicorn app.main:app --port 8000",
  "test_command": "pytest tests/"
}
```

## Run Loop
```
1. inject_memory(architecture)
2. Generate file list from architecture
3. For each file: write_file(path, content)
4. run_command("pip install -r requirements.txt")
5. run_command("python -m pytest tests/ --tb=short")
6. If tests fail: read error, fix files (max 2 retry loops)
7. write_memory(file manifest)
8. emit task.completed
```

## Key Files
```
agents/backend-agent/
  agent.py
  tools.py        ← write_file, run_command scoped to Docker sandbox
  prompts.py
  sandbox/
    Dockerfile    ← isolated Python environment for generated code
```
