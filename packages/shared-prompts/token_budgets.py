from dataclasses import dataclass

@dataclass
class Budget:
    input: int
    output: int
    model: str

TOKEN_BUDGETS: dict[str, Budget] = {
    "research-agent":   Budget(input=8000,  output=2000, model="claude-haiku-4-5-20251001"),
    "pm-agent":         Budget(input=6000,  output=3000, model="claude-haiku-4-5-20251001"),
    "architect-agent":  Budget(input=8000,  output=4000, model="claude-sonnet-4-6"),
    "backend-agent":    Budget(input=12000, output=6000, model="claude-sonnet-4-6"),
    "frontend-agent":   Budget(input=10000, output=5000, model="claude-sonnet-4-6"),
    "qa-agent":         Budget(input=6000,  output=2000, model="claude-haiku-4-5-20251001"),
    "deployment-agent": Budget(input=4000,  output=1000, model="claude-haiku-4-5-20251001"),
    "orchestrator":     Budget(input=10000, output=3000, model="claude-sonnet-4-6"),
}

def get_budget(agent_name: str) -> Budget:
    if agent_name not in TOKEN_BUDGETS:
        raise ValueError(f"No token budget defined for agent: {agent_name}")
    return TOKEN_BUDGETS[agent_name]
