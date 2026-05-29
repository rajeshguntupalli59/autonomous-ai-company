-- Layer 1 schema lives in services/api-gateway/migrations/
-- This file only sets up extensions and the base database.

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── agents ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agents (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(100) NOT NULL UNIQUE,
    role        TEXT NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'idle',  -- idle | running | error
    config      JSONB NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── tasks ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type        VARCHAR(100) NOT NULL,
    payload     JSONB NOT NULL DEFAULT '{}',
    status      VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending | running | completed | failed
    agent_id    UUID REFERENCES agents(id),
    result      JSONB,
    error       TEXT,
    retries     INT NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── memory ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS memory (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id     UUID,
    memory_type  VARCHAR(50) NOT NULL DEFAULT 'agent_memory',
    content      TEXT NOT NULL,
    embedding    vector(1536),
    expires_at   TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS memory_embedding_idx
    ON memory USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

CREATE INDEX IF NOT EXISTS memory_agent_id_idx ON memory (agent_id);

-- ─── events ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type         VARCHAR(100) NOT NULL,
    source       VARCHAR(100) NOT NULL,
    payload      JSONB NOT NULL DEFAULT '{}',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS events_type_idx ON events (type);

-- ─── workflows ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workflows (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          VARCHAR(100) NOT NULL,
    goal          TEXT NOT NULL,
    steps         JSONB NOT NULL DEFAULT '[]',
    status        VARCHAR(30) NOT NULL DEFAULT 'created',
    current_step  VARCHAR(100),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── token_logs ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS token_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id        UUID REFERENCES agents(id),
    task_id         UUID REFERENCES tasks(id),
    model           VARCHAR(80) NOT NULL,
    input_tokens    INT NOT NULL DEFAULT 0,
    output_tokens   INT NOT NULL DEFAULT 0,
    cached_tokens   INT NOT NULL DEFAULT 0,
    cost_usd        NUMERIC(10,6) NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── dead_letter ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dead_letter (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stream      VARCHAR(100) NOT NULL,
    event_id    VARCHAR(100) NOT NULL,
    payload     JSONB NOT NULL,
    error       TEXT,
    attempts    INT NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed the 7 core agents
INSERT INTO agents (name, role, status) VALUES
    ('research-agent',    'Discover and score SaaS market opportunities',               'idle'),
    ('pm-agent',          'Generate PRDs from research results',                        'idle'),
    ('architect-agent',   'Design DB schema, API, and folder structure from PRD',       'idle'),
    ('backend-agent',     'Generate FastAPI Python code from architecture spec',        'idle'),
    ('frontend-agent',    'Generate Next.js TypeScript code from architecture spec',    'idle'),
    ('qa-agent',          'Run tests, security checks, and approve/block deployment',   'idle'),
    ('deployment-agent',  'Deploy QA-approved code to Railway and Vercel',              'idle')
ON CONFLICT (name) DO NOTHING;
