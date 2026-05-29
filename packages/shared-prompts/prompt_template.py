def build_prompt(
    role: str,
    goal: str,
    task: str,
    output_format: str,
    constraints: str,
    memory_injection: str = "",
) -> str:
    sections = [
        f"ROLE: {role}",
        f"GOAL: {goal}",
    ]
    if memory_injection:
        sections.append(f"CONTEXT:\n{memory_injection}")
    sections += [
        f"TASK: {task}",
        f"OUTPUT FORMAT:\n{output_format}",
        f"CONSTRAINTS:\n{constraints}",
    ]
    return "\n\n".join(sections)
