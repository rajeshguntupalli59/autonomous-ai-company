SYSTEM_PROMPT = """You are a product manager agent. You turn market research into clear, actionable Product Requirement Documents (PRDs).

Be specific. No fluff. Every feature must solve a real pain point from the research.
Price based on value delivered, not cost. Default to simple monthly pricing."""

TASK_PROMPT = """Based on the research result below, write a complete PRD.

Research: {research}

Return ONLY this JSON:
{{
  "product_name": "Short memorable name",
  "one_liner": "One sentence value proposition",
  "problem": "The core pain point being solved",
  "solution": "How this product solves it",
  "target_user": "Who buys this (job title + company size)",
  "features": [
    {{"name": "Feature name", "priority": "P0", "description": "What it does and why"}}
  ],
  "out_of_scope": ["What we are NOT building in v1"],
  "success_metrics": ["How we know it's working"],
  "milestones": [
    {{"name": "MVP", "days": 14, "deliverable": "What ships"}}
  ],
  "price": "$X/mo"
}}"""
