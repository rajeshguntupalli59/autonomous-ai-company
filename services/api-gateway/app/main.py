from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
load_dotenv()

from app.middleware.logging import LoggingMiddleware
from app.middleware.errors import global_error_handler
from app.redis.client import close_redis
from app.routers import health, auth

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await close_redis()

def create_app() -> FastAPI:
    app = FastAPI(title="AIC API Gateway", version="0.1.0", lifespan=lifespan)

    app.add_middleware(LoggingMiddleware)
    app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
    app.add_exception_handler(Exception, global_error_handler)

    app.include_router(health.router)
    app.include_router(auth.router)

    return app

app = create_app()
