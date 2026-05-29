"""
Layer 7 chain test: Research -> PM -> Architect -> Backend -> QA -> Deploy
All 6 agents run in sequence with stub providers (no API key needed).
Run: python test_chain.py
"""
import asyncio, json, os, sys
os.environ.setdefault("REDIS_URL", "redis://localhost:6380/0")
os.environ.setdefault("MEMORY_SERVICE_URL", "http://localhost:8001")
os.environ.setdefault("SANDBOX_ROOT", os.path.join(os.path.expanduser("~"), "aic-sandbox"))

_SHARED = os.path.join(os.path.dirname(__file__), "..", "packages", "shared-tools")
if _SHARED not in sys.path: sys.path.insert(0, _SHARED)

from agent_runtime.providers.base import ModelProvider, CompletionResult


def stub(response: str, tool_calls: list[dict] | None = None):
    """Return a provider that fires tool_calls in sequence then returns response."""
    _calls = tool_calls or []
    class _Stub(ModelProvider):
        _t = 0
        async def complete(self, messages, system_blocks, tools, max_tokens):
            self._t += 1
            if _calls and self._t <= len(_calls):
                return CompletionResult("", [_calls[self._t - 1]], 100, 50, 60, "tool_use")
            return CompletionResult(response, [], 200, 100, 120, "end_turn")
    return _Stub()


async def run():
    print("\n=== Layer 7 Chain Test: 6-Agent Pipeline ===\n")

    # ── Step 1: Research Agent ────────────────────────────────────────────────
    print("[1/6] Research Agent")
    import importlib.util, importlib

    def load_agent(folder: str, mod_name: str):
        path = os.path.join(os.path.dirname(__file__), folder)
        if path in sys.path: sys.path.remove(path)
        sys.path.insert(0, path)
        for key in ["prompts", "tools", "agent"]:
            sys.modules.pop(key, None)
        spec = importlib.util.spec_from_file_location(mod_name, os.path.join(path, "agent.py"))
        mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
        return mod

    ra_mod = load_agent("research-agent", "ra")
    research_result = {"opportunities": [{"title": "PG Health Dashboard", "score": 82, "mrr_estimate": "$99/mo", "problem": "No affordable self-hosted Postgres monitoring"}], "summary": "Strong demand for self-hosted Postgres tooling."}
    research_agent = ra_mod.ResearchAgent("research-agent", stub(json.dumps(research_result)))
    r1 = await research_agent.run("chain-001", "research", {"query": "DBA tools"})
    assert "opportunities" in r1
    print(f"   done: {r1['opportunities'][0]['title']} score={r1['opportunities'][0]['score']}")

    # ── Step 2: PM Agent ─────────────────────────────────────────────────────
    print("[2/6] PM Agent")
    pm_mod = load_agent("pm-agent", "pm")
    prd = {"product_name": "PGWatch", "one_liner": "Self-hosted Postgres monitoring for indie teams", "problem": "No affordable tooling", "solution": "Lightweight dashboard", "target_user": "Solo devs + small teams", "features": [{"name": "Slow Query Log", "priority": "P0", "description": "Surface top slow queries"}], "out_of_scope": ["Enterprise SSO"], "success_metrics": ["10 paying users in 30 days"], "milestones": [{"name": "MVP", "days": 14, "deliverable": "Dashboard + slow queries"}], "price": "$29/mo"}
    pm_agent = pm_mod.PMAgent("pm-agent", stub(json.dumps(prd)))
    r2 = await pm_agent.run("chain-002", "generate_prd", {"research": r1})
    assert "product_name" in r2
    print(f"   done: {r2['product_name']} @ {r2['price']}")

    # ── Step 3: Architect Agent ───────────────────────────────────────────────
    print("[3/6] Architect Agent")
    arch_mod = load_agent("architect-agent", "arch")
    arch = {"stack": {"backend": "FastAPI + Python 3.12", "frontend": "Next.js 14", "database": "PostgreSQL 16", "cache": "Redis 7"}, "db_schema": "CREATE TABLE queries (id UUID PRIMARY KEY, query TEXT, duration_ms INT, created_at TIMESTAMPTZ DEFAULT NOW());", "api_routes": [{"method": "GET", "path": "/api/queries", "description": "List slow queries"}, {"method": "POST", "path": "/api/queries/analyze", "description": "Trigger analysis"}], "folder_structure": "backend/\n  app/\n    main.py\n    models.py", "services": ["backend", "frontend"], "external_apis": [], "estimated_files": 8}
    arch_agent = arch_mod.ArchitectAgent("architect-agent", stub(json.dumps(arch)))
    r3 = await arch_agent.run("chain-003", "generate_architecture", {"prd": r2})
    assert "stack" in r3
    print(f"   done: {len(r3['api_routes'])} routes, ~{r3['estimated_files']} files")

    # ── Step 4: Backend Agent ─────────────────────────────────────────────────
    print("[4/6] Backend Coding Agent")
    be_mod = load_agent("backend-agent", "be")
    backend_manifest = {"project": "pgwatch-backend", "files": ["requirements.txt", "app/main.py", "app/models.py", "app/database.py", "tests/test_main.py"], "install_command": "pip install -r requirements.txt", "run_command": "uvicorn app.main:app --port 8000", "test_command": "python -m pytest tests/ -x", "tests_passed": True}
    be_tools = [
        {"id": "t1", "name": "write_file", "input": {"path": "app/main.py", "content": "from fastapi import FastAPI\napp = FastAPI()\n@app.get('/health')\ndef health(): return {'status':'ok'}\n", "project": "pgwatch-backend"}},
        {"id": "t2", "name": "write_file", "input": {"path": "tests/test_main.py", "content": "from fastapi.testclient import TestClient\nfrom app.main import app\nclient = TestClient(app)\ndef test_health(): assert client.get('/health').status_code == 200\n", "project": "pgwatch-backend"}},
        {"id": "t3", "name": "run_command", "input": {"command": "echo 'tests passed'", "project": "pgwatch-backend"}},
    ]
    be_agent = be_mod.BackendAgent("backend-agent", stub(json.dumps(backend_manifest), tool_calls=be_tools))
    r4 = await be_agent.run("chain-004", "build_backend", {"architecture": r3, "project_name": "pgwatch-backend"})
    assert "files" in r4
    print(f"   done: {len(r4['files'])} files written, tests_passed={r4.get('tests_passed')}")

    # ── Step 5: QA Agent ─────────────────────────────────────────────────────
    print("[5/6] QA Agent")
    qa_mod = load_agent("qa-agent", "qa")
    qa_report = {"passed": True, "test_results": {"total": 1, "passed": 1, "failed": 0}, "bugs": [], "security_issues": [], "deploy_approved": True, "notes": "All checks passed. No security issues found."}
    qa_tools = [
        {"id": "t1", "name": "run_command", "input": {"command": "echo '1 passed'", "project": "pgwatch-backend"}},
        {"id": "t2", "name": "run_command", "input": {"command": "echo 'no secrets found'", "project": "pgwatch-backend"}},
    ]
    qa_agent = qa_mod.QAAgent("qa-agent", stub(json.dumps(qa_report), tool_calls=qa_tools))
    r5 = await qa_agent.run("chain-005", "run_qa", {"backend_manifest": r4, "project_name": "pgwatch-backend"})
    assert r5.get("deploy_approved") is True
    print(f"   done: passed={r5['passed']}, deploy_approved={r5['deploy_approved']}, bugs={len(r5.get('bugs',[]))}")

    # ── Step 6: Deployment Agent ──────────────────────────────────────────────
    print("[6/6] Deployment Agent")
    dep_mod = load_agent("deployment-agent", "dep")
    deploy_result = {"backend_url": "https://pgwatch-backend.railway.app", "frontend_url": "https://pgwatch.vercel.app", "deployed_at": "2026-05-29T21:00:00Z", "deploy_approved_confirmed": True, "notes": "Deployed successfully"}
    dep_tools = [
        {"id": "t1", "name": "railway_deploy", "input": {"project_path": "pgwatch-backend", "project_name": "pgwatch"}},
        {"id": "t2", "name": "vercel_deploy", "input": {"project_path": "pgwatch-frontend", "project_name": "pgwatch"}},
    ]
    dep_agent = dep_mod.DeploymentAgent("deployment-agent", stub(json.dumps(deploy_result), tool_calls=dep_tools))
    r6 = await dep_agent.run("chain-006", "deploy", {"qa_report": r5, "backend_path": "pgwatch-backend", "frontend_path": "pgwatch-frontend"})
    assert "backend_url" in r6
    print(f"   done: backend={r6['backend_url']}")
    print(f"         frontend={r6['frontend_url']}")

    print("\n=== LAYER 7 COMPLETE ===")
    print("Full pipeline passed:")
    print(f"  Research  -> {r1['opportunities'][0]['title']}")
    print(f"  PM        -> {r2['product_name']} ({r2['price']})")
    print(f"  Architect -> {len(r3['api_routes'])} routes")
    print(f"  Backend   -> {len(r4['files'])} files")
    print(f"  QA        -> deploy_approved={r5['deploy_approved']}")
    print(f"  Deploy    -> {r6['backend_url']}\n")


if __name__ == "__main__":
    asyncio.run(run())
