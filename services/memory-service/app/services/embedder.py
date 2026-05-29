import os
import hashlib
import math
from openai import AsyncOpenAI

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
EMBEDDING_MODEL = "text-embedding-3-small"
VECTOR_DIM = 1536

_client: AsyncOpenAI | None = None

def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(api_key=OPENAI_API_KEY)
    return _client

async def embed(text: str) -> list[float]:
    """Embed text. Falls back to deterministic pseudo-embedding if no API key."""
    if not OPENAI_API_KEY:
        return _pseudo_embed(text)
    response = await _get_client().embeddings.create(input=text, model=EMBEDDING_MODEL)
    return response.data[0].embedding

def _pseudo_embed(text: str) -> list[float]:
    """Deterministic hash-based vector — for dev without an OpenAI key.
    Semantic search won't work but the system runs end-to-end.
    """
    seed = int(hashlib.sha256(text.encode()).hexdigest(), 16)
    vec = []
    for i in range(VECTOR_DIM):
        val = math.sin(seed * (i + 1) * 0.0001)
        vec.append(val)
    mag = math.sqrt(sum(v * v for v in vec)) or 1.0
    return [v / mag for v in vec]
