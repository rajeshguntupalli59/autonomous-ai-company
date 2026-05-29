"""
Product Creation Workflow: Research -> PM -> Architect -> Backend -> Frontend -> QA -> Deploy
Each step maps to an agent task type. Deploy step has requires_approval=True.
"""

STEPS = [
    {
        "name": "research",
        "task_type": "research",
        "agent": "research-agent",
        "requires_approval": False,
        "build_payload": lambda goal, ctx: {"query": goal},
    },
    {
        "name": "pm",
        "task_type": "generate_prd",
        "agent": "pm-agent",
        "requires_approval": False,
        "build_payload": lambda goal, ctx: {"research": ctx.get("research", {}), "goal": goal},
    },
    {
        "name": "architect",
        "task_type": "generate_architecture",
        "agent": "architect-agent",
        "requires_approval": False,
        "build_payload": lambda goal, ctx: {"prd": ctx.get("pm", {}), "goal": goal},
    },
    {
        "name": "backend",
        "task_type": "build_backend",
        "agent": "backend-agent",
        "requires_approval": False,
        "build_payload": lambda goal, ctx: {
            "architecture": ctx.get("architect", {}),
            "project_name": ctx.get("pm", {}).get("product_name", "generated-app").lower().replace(" ", "-"),
        },
    },
    {
        "name": "frontend",
        "task_type": "build_frontend",
        "agent": "frontend-agent",
        "requires_approval": False,
        "build_payload": lambda goal, ctx: {
            "architecture": ctx.get("architect", {}),
            "project_name": ctx.get("pm", {}).get("product_name", "generated-app").lower().replace(" ", "-"),
            "api_url": "http://localhost:8000",
        },
    },
    {
        "name": "qa",
        "task_type": "run_qa",
        "agent": "qa-agent",
        "requires_approval": False,
        "build_payload": lambda goal, ctx: {
            "backend_manifest": ctx.get("backend", {}),
            "project_name": ctx.get("pm", {}).get("product_name", "generated-app").lower().replace(" ", "-"),
        },
    },
    {
        "name": "deploy",
        "task_type": "deploy",
        "agent": "deployment-agent",
        "requires_approval": True,
        "build_payload": lambda goal, ctx: {
            "qa_report": ctx.get("qa", {}),
            "backend_path": ctx.get("backend", {}).get("project", ""),
            "frontend_path": ctx.get("frontend", {}).get("project", ""),
        },
    },
]

def get_step(name: str) -> dict | None:
    return next((s for s in STEPS if s["name"] == name), None)

def next_step(current_name: str | None) -> dict | None:
    if current_name is None:
        return STEPS[0]
    for i, s in enumerate(STEPS):
        if s["name"] == current_name and i + 1 < len(STEPS):
            return STEPS[i + 1]
    return None
