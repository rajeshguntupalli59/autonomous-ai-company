import hashlib

def get_cache_blocks(system_prompt: str, memory_injection: str, task_content: str) -> list[dict]:
    """
    Returns Anthropic messages with cache_control applied.
    - system_prompt → always cached (static per agent)
    - memory_injection → cached when content unchanged (by hash)
    - task_content → never cached (dynamic every run)
    """
    blocks = [
        {
            "type": "text",
            "text": system_prompt,
            "cache_control": {"type": "ephemeral"},
        }
    ]
    if memory_injection:
        blocks.append({
            "type": "text",
            "text": memory_injection,
            "cache_control": {"type": "ephemeral"},
        })
    blocks.append({
        "type": "text",
        "text": task_content,
    })
    return blocks

def content_hash(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()[:16]
