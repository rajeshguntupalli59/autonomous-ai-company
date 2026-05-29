import json
import logging
import time
import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
load_dotenv()

from app.redis.cache import close
from app.routers.memory import router as memory_router

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger("aic.memory")

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await close()

app = FastAPI(title="AIC Memory Service", version="0.1.0", lifespan=lifespan)

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.middleware("http")
async def log_requests(request: Request, call_next) -> Response:
    request_id = str(uuid.uuid4())[:8]
    start = time.perf_counter()
    response = await call_next(request)
    ms = round((time.perf_counter() - start) * 1000, 2)
    logger.info(json.dumps({"request_id": request_id, "method": request.method,
                            "path": request.url.path, "status": response.status_code, "duration_ms": ms}))
    return response

app.include_router(memory_router)

@app.get("/health")
async def health():
    return {"status": "ok", "service": "memory"}
