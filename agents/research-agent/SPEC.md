# Agent: Research Agent

Layer: 6 (first agent — validate full pipeline here)
Model: claude-haiku-4-5-20251001
Token budget: 8,000 in / 2,000 out

## Role
Discover and score SaaS opportunities. Find gaps in markets. Rank by MRR potential.

## Tools
| Tool | Source | Purpose |
|---|---|---|
| web_search | Brave Search API | General market research |
| reddit_fetch | Reddit API | Find pain points in communities |
| github_trends | GitHub API | Trending repos = developer needs |
| read_memory | memory-service | Past research results |
| write_memory | memory-service | Store scored opportunities |

## Input (from task payload)
```json
{ "query": "find SaaS opportunity in DBA tools", "depth": "standard" }
```

## Output (written to memory + emitted in task.completed)
```json
{
  "opportunities": [
    {
      "title": "...",
      "problem": "...",
      "target_audience": "...",
      "mrr_estimate": "...",
      "competition_level": "low|medium|high",
      "score": 0-100,
      "sources": ["..."]
    }
  ]
}
```

## Run Loop
```
1. inject_memory(top-3 past research by similarity)
2. web_search(query)
3. reddit_fetch(relevant subreddits)
4. github_trends(related keywords)
5. Claude Haiku → score each opportunity
6. write_memory(results)
7. emit task.completed
```

## Key Files
```
agents/research-agent/
  agent.py        ← BaseAgent subclass
  tools.py        ← web_search, reddit_fetch, github_trends implementations
  prompts.py      ← system prompt + scoring prompt (cached)
```

## E2E Test (Layer 6 pass criteria)
```
POST /tasks { type: "research", query: "find SaaS opportunity in DBA tools" }
→ Agent picks up task from Redis Stream
→ Runs 3 tools
→ Scores results via Haiku
→ Writes to memory-service
→ Emits task.completed
→ GET /memory/search?query=DBA → returns scored result
```
