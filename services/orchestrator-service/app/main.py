import asyncio
import json
import logging
import time
import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from app.db.base import engine
from app.db.models.workflow import WorkflowRun
from app.routers.workflow import router as workflow_router, get_orchestrator
from sqlalchemy import text

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger("aic.orchestrator-api")


async def _ensure_table():
    async with engine.begin() as conn:
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS workflow_runs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(100) NOT NULL,
                goal TEXT NOT NULL,
                status VARCHAR(30) NOT NULL DEFAULT 'created',
                current_step VARCHAR(100),
                steps JSONB NOT NULL DEFAULT '[]',
                context JSONB NOT NULL DEFAULT '{}',
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        """))


@asynccontextmanager
async def lifespan(app: FastAPI):
    await _ensure_table()
    orch = get_orchestrator()
    loop_task = asyncio.create_task(orch.run_event_loop())
    yield
    await orch.stop()
    loop_task.cancel()


app = FastAPI(title="AIC Orchestrator", version="0.1.0", lifespan=lifespan)

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.middleware("http")
async def log_requests(request: Request, call_next) -> Response:
    rid = str(uuid.uuid4())[:8]
    start = time.perf_counter()
    response = await call_next(request)
    ms = round((time.perf_counter() - start) * 1000, 2)
    logger.info(json.dumps({"rid": rid, "method": request.method,
                            "path": request.url.path, "status": response.status_code, "ms": ms}))
    return response

app.include_router(workflow_router)

@app.get("/health")
async def health():
    return {"status": "ok", "service": "orchestrator"}
