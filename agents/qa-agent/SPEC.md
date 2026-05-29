# Agent: QA Agent

Layer: 7
Model: claude-haiku-4-5-20251001
Token budget: 6,000 in / 2,000 out

## Role
Reviews generated code, runs tests, reports bugs. Blocks deployment if tests fail.

## Tools
| Tool | Purpose |
|---|---|
| read_memory | Fetch backend + frontend file manifests |
| read_file | Read generated code for review |
| run_command | Run test suite in sandbox |
| write_memory | Store QA report |

## Input
Backend + frontend manifests from memory

## Output (written to memory)
```json
{
  "qa_report": {
    "passed": true,
    "test_results": { "total": 0, "passed": 0, "failed": 0 },
    "bugs": [
      { "severity": "critical|high|medium|low", "file": "...", "description": "...", "line": 0 }
    ],
    "security_issues": ["..."],
    "deploy_approved": true
  }
}
```

## Checks Performed
1. Run backend test suite (`pytest`)
2. Run frontend build (`pnpm build`)
3. Check for hardcoded secrets (grep for API keys, passwords)
4. Check for SQL injection patterns
5. Verify all API routes have auth middleware
6. Verify no `console.log` or `print` debug statements

## Deployment Gate
`deploy_approved: false` if:
- Any critical or high severity bug
- Any security issue found
- Test suite fails
- Frontend build fails

Orchestrator will NOT proceed to Deploy Agent until `deploy_approved: true`.

## Key Files
```
agents/qa-agent/
  agent.py
  tools.py      ← run_command scoped to sandbox
  prompts.py
  checks/
    security.py ← hardcoded secret patterns, SQL injection patterns
```
