# Agent: Frontend Coding Agent

Layer: 7
Model: claude-sonnet-4-6
Token budget: 10,000 in / 5,000 out

## Role
Generates Next.js + Tailwind frontend from architecture spec and backend API routes.

## Tools
| Tool | Purpose |
|---|---|
| read_memory | Fetch architecture + backend manifest |
| write_file | Write Next.js/TypeScript/CSS files |
| read_file | Self-review generated components |
| write_memory | Store frontend manifest |

## Input
Architecture + backend file manifest from memory

## Output (written to memory)
```json
{
  "frontend_path": "/sandbox/{project_name}-web",
  "files": ["app/page.tsx", "app/components/...", "..."],
  "run_command": "pnpm dev",
  "build_command": "pnpm build"
}
```

## Standards Enforced in Prompt
- TypeScript strict mode
- Tailwind only (no inline styles except dynamic values)
- Mobile-first responsive
- No placeholder data — connects to real backend API
- Loading states + error states on every data fetch
- No console.log in output

## Key Files
```
agents/frontend-agent/
  agent.py
  tools.py
  prompts.py    ← includes UI standards in cached system prompt
```
