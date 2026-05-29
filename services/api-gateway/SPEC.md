# Service: API Gateway

Port: 8000
Layer: 2 (Core API)

## Responsibility
Single entry point for all external requests. Auth, routing, rate limiting.

## Endpoints (Layer 2 — thin skeleton only)
```
POST /auth/login          → returns JWT
POST /auth/verify         → validates JWT
GET  /health              → { status: ok }
GET  /ready               → checks DB + Redis connectivity
```
Agents add their own routes in later layers. Do not add business logic here.

## Tech
- FastAPI app factory pattern
- JWT (HS256) via `python-jose`
- RBAC middleware: roles = admin | agent | human
- Structured JSON logging with request IDs
- Error handler middleware (never expose stack traces externally)

## Dependencies
- PostgreSQL (users, sessions)
- Redis (rate limiting, session cache)

## Key Files
```
app/
  main.py          ← FastAPI factory
  auth/
    jwt.py         ← encode/decode/verify
    middleware.py  ← RBAC check
  middleware/
    logging.py     ← request ID injection
    errors.py      ← global error handler
  routers/
    auth.py        ← /auth/* routes
    health.py      ← /health, /ready
```

## Tests (Layer 2 done when these pass)
- POST /auth/login → 200 + valid JWT
- GET /health → 200
- GET /ready → 200 (DB + Redis up)
- Invalid JWT → 401
