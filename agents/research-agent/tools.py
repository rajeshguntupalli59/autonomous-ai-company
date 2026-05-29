import os
import json
import httpx
import sys

_SHARED = os.path.join(os.path.dirname(__file__), "..", "..", "packages", "shared-tools")
if _SHARED not in sys.path:
    sys.path.insert(0, _SHARED)

from base_tool import BaseTool

BRAVE_API_KEY   = os.getenv("BRAVE_SEARCH_API_KEY", "")
GITHUB_TOKEN    = os.getenv("GITHUB_TOKEN", "")
MEMORY_URL      = os.getenv("MEMORY_SERVICE_URL", "http://localhost:8001")

# ── Web Search (Brave) ────────────────────────────────────────────────────────

class WebSearchTool(BaseTool):
    name = "web_search"
    description = "Search the web for market research, trends, and competitor information."

    def input_schema(self) -> dict:
        return {"type": "object", "properties": {
            "query": {"type": "string", "description": "Search query"},
            "count": {"type": "integer", "description": "Number of results", "default": 5},
        }, "required": ["query"]}

    async def run(self, input: dict) -> dict:
        query = input["query"]
        count = input.get("count", 5)

        if not BRAVE_API_KEY:
            return _mock_web_results(query)

        async with httpx.AsyncClient(timeout=10) as c:
            r = await c.get(
                "https://api.search.brave.com/res/v1/web/search",
                headers={"Accept": "application/json", "X-Subscription-Token": BRAVE_API_KEY},
                params={"q": query, "count": count},
            )
            r.raise_for_status()
            data = r.json()
            results = data.get("web", {}).get("results", [])
            return {"results": [{"title": x["title"], "url": x["url"],
                                  "description": x.get("description", "")} for x in results]}

# ── Reddit Fetch ──────────────────────────────────────────────────────────────

class RedditFetchTool(BaseTool):
    name = "reddit_fetch"
    description = "Find developer pain points and discussions on Reddit."

    def input_schema(self) -> dict:
        return {"type": "object", "properties": {
            "subreddit": {"type": "string", "description": "e.g. PostgreSQL, devops, sysadmin"},
            "query": {"type": "string", "description": "Search query"},
            "limit": {"type": "integer", "default": 5},
        }, "required": ["subreddit", "query"]}

    async def run(self, input: dict) -> dict:
        subreddit = input["subreddit"]
        query = input["query"]
        limit = input.get("limit", 5)

        async with httpx.AsyncClient(timeout=10,
            headers={"User-Agent": "AIC-Research-Agent/1.0"}) as c:
            try:
                r = await c.get(
                    f"https://www.reddit.com/r/{subreddit}/search.json",
                    params={"q": query, "limit": limit, "sort": "relevance", "restrict_sr": 1},
                )
                r.raise_for_status()
                posts = r.json().get("data", {}).get("children", [])
                return {"posts": [{"title": p["data"]["title"],
                                   "score": p["data"]["score"],
                                   "url": f"https://reddit.com{p['data']['permalink']}",
                                   "selftext": p["data"].get("selftext", "")[:300]}
                                  for p in posts[:limit]]}
            except Exception:
                return _mock_reddit_results(query)

# ── GitHub Trends ─────────────────────────────────────────────────────────────

class GitHubTrendsTool(BaseTool):
    name = "github_trends"
    description = "Find trending GitHub repos to identify developer needs and gaps."

    def input_schema(self) -> dict:
        return {"type": "object", "properties": {
            "keywords": {"type": "string", "description": "e.g. postgres, database, monitoring"},
            "language": {"type": "string", "description": "e.g. python, javascript", "default": ""},
        }, "required": ["keywords"]}

    async def run(self, input: dict) -> dict:
        keywords = input["keywords"]
        language = input.get("language", "")
        q = f"{keywords}+in:description,name"
        if language:
            q += f"+language:{language}"

        headers = {"Accept": "application/vnd.github.v3+json"}
        if GITHUB_TOKEN:
            headers["Authorization"] = f"token {GITHUB_TOKEN}"

        async with httpx.AsyncClient(timeout=10) as c:
            try:
                r = await c.get(
                    "https://api.github.com/search/repositories",
                    headers=headers,
                    params={"q": q, "sort": "stars", "order": "desc", "per_page": 5},
                )
                r.raise_for_status()
                items = r.json().get("items", [])
                return {"repos": [{"name": x["full_name"], "stars": x["stargazers_count"],
                                   "description": x.get("description", ""),
                                   "url": x["html_url"]} for x in items]}
            except Exception:
                return _mock_github_results(keywords)

# ── Memory Read/Write ─────────────────────────────────────────────────────────

class ReadMemoryTool(BaseTool):
    name = "read_memory"
    description = "Retrieve relevant past research from memory."

    def input_schema(self) -> dict:
        return {"type": "object", "properties": {
            "query": {"type": "string"},
            "agent_id": {"type": "string"},
            "top_k": {"type": "integer", "default": 3},
        }, "required": ["query"]}

    async def run(self, input: dict) -> dict:
        async with httpx.AsyncClient(timeout=10) as c:
            try:
                r = await c.get(f"{MEMORY_URL}/memory/search",
                    params={"query": input["query"],
                            "agent_id": input.get("agent_id", ""),
                            "top_k": input.get("top_k", 3)})
                r.raise_for_status()
                return r.json()
            except Exception as e:
                return {"results": [], "error": str(e)}

class WriteMemoryTool(BaseTool):
    name = "write_memory"
    description = "Store research results to memory for future reference."

    def input_schema(self) -> dict:
        return {"type": "object", "properties": {
            "content": {"type": "string"},
            "agent_id": {"type": "string"},
            "memory_type": {"type": "string", "default": "agent_memory"},
        }, "required": ["content"]}

    async def run(self, input: dict) -> dict:
        async with httpx.AsyncClient(timeout=15) as c:
            try:
                r = await c.post(f"{MEMORY_URL}/memory",
                    json={"content": input["content"],
                          "agent_id": input.get("agent_id", ""),
                          "memory_type": input.get("memory_type", "agent_memory"),
                          "ttl_days": 30})
                r.raise_for_status()
                return r.json()
            except Exception as e:
                return {"error": str(e)}

# ── Mock fallbacks (no API key needed) ───────────────────────────────────────

def _mock_web_results(query: str) -> dict:
    return {"results": [
        {"title": "Top PostgreSQL monitoring tools 2025", "url": "https://example.com/pg-monitor",
         "description": "Teams struggle to get visibility into slow queries and index bloat without expensive enterprise tools."},
        {"title": "DBA pain points survey 2025", "url": "https://example.com/dba-survey",
         "description": "60% of DBAs report spending >4 hours/week on manual query tuning. Tooling gap is significant."},
        {"title": "Database observability market growing 28% CAGR",
         "url": "https://example.com/db-market",
         "description": "Self-hosted database tools market valued at $2.1B, growing rapidly post-cloud-repatriation trend."},
    ], "_mock": True}

def _mock_reddit_results(query: str) -> dict:
    return {"posts": [
        {"title": "Tired of paying $500/mo for a query analyzer that does 3 things",
         "score": 342, "url": "https://reddit.com/r/postgresql/mock1",
         "selftext": "We just want slow query logs + index suggestions + table bloat. Why is everything enterprise pricing?"},
        {"title": "What tools do you use for PostgreSQL health monitoring?",
         "score": 187, "url": "https://reddit.com/r/devops/mock2",
         "selftext": "Looking for something self-hosted, open source or cheap. pgBadger is good but hard to setup."},
    ], "_mock": True}

def _mock_github_results(keywords: str) -> dict:
    return {"repos": [
        {"name": "ankane/pghero", "stars": 8200, "url": "https://github.com/ankane/pghero",
         "description": "A performance dashboard for Postgres — 8k stars shows massive unmet demand"},
        {"name": "darold/pgbadger", "stars": 3100, "url": "https://github.com/darold/pgbadger",
         "description": "PostgreSQL log analyzer — complex setup is a known pain point"},
    ], "_mock": True}
