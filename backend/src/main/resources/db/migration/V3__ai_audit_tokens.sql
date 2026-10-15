-- V3: AI features, audit, outbox, tokens
-- Migration: V3__ai_audit_tokens.sql

-- ============================================================
-- AI ANALYSIS RESULTS
-- ============================================================
CREATE TABLE ai_analysis (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type           VARCHAR(30) NOT NULL
                   CHECK (type IN ('RESUME_ANALYSIS','JOB_MATCH','INTERVIEW_PREP','RESUME_COMPARE')),
    requester_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resume_id      UUID REFERENCES resumes(id) ON DELETE CASCADE,
    job_id         UUID REFERENCES jobs(id) ON DELETE CASCADE,
    status         VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                   CHECK (status IN ('PENDING','PROCESSING','COMPLETED','FAILED')),
    result_json    JSONB,
    error_message  VARCHAR(500),
    model_used     VARCHAR(100),
    tokens_used    INTEGER,
    duration_ms    INTEGER,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at   TIMESTAMPTZ
);

CREATE INDEX idx_ai_analysis_requester_id ON ai_analysis(requester_id);
CREATE INDEX idx_ai_analysis_status       ON ai_analysis(status);
CREATE INDEX idx_ai_analysis_type         ON ai_analysis(type);
CREATE INDEX idx_ai_analysis_resume_id    ON ai_analysis(resume_id) WHERE resume_id IS NOT NULL;

-- ============================================================
-- DOCUMENT EMBEDDINGS (pgvector)
-- ============================================================
CREATE TABLE document_embeddings (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_type  VARCHAR(30) NOT NULL CHECK (document_type IN ('JOB','RESUME','CANDIDATE_PROFILE')),
    document_id    UUID NOT NULL,
    chunk_index    INTEGER NOT NULL DEFAULT 0,
    content        TEXT NOT NULL,
    embedding      vector(1536),           -- dimensions match text-embedding-3-small
    model_id       VARCHAR(100) NOT NULL DEFAULT 'text-embedding-3-small',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_doc_embeddings_unique ON document_embeddings(document_type, document_id, chunk_index);
CREATE INDEX idx_doc_embeddings_document_id   ON document_embeddings(document_id);
CREATE INDEX idx_doc_embeddings_type          ON document_embeddings(document_type);

-- HNSW index for fast approximate nearest-neighbor search
-- Cosine distance is best for normalized embeddings
CREATE INDEX idx_doc_embeddings_hnsw ON document_embeddings
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- ============================================================
-- REFRESH TOKENS
-- ============================================================
CREATE TABLE refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(255) NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    revoked     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_user_id     ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at  ON refresh_tokens(expires_at);

-- ============================================================
-- PASSWORD RESET TOKENS
-- ============================================================
CREATE TABLE password_reset_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(255) NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    used        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_prt_token_hash ON password_reset_tokens(token_hash);
CREATE INDEX idx_prt_user_id          ON password_reset_tokens(user_id);

-- ============================================================
-- EMAIL VERIFICATION TOKENS
-- ============================================================
CREATE TABLE email_verification_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(255) NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    used        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_evt_token_hash ON email_verification_tokens(token_hash);

-- ============================================================
-- AUDIT EVENTS
-- ============================================================
CREATE TABLE audit_events (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id    UUID REFERENCES users(id),
    action      VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id   UUID,
    old_value   JSONB,
    new_value   JSONB,
    ip_address  VARCHAR(45),
    user_agent  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_events_actor_id   ON audit_events(actor_id);
CREATE INDEX idx_audit_events_action     ON audit_events(action);
CREATE INDEX idx_audit_events_entity     ON audit_events(entity_type, entity_id);
CREATE INDEX idx_audit_events_created_at ON audit_events(created_at DESC);

-- ============================================================
-- OUTBOX (transactional outbox pattern)
-- ============================================================
CREATE TABLE outbox_events (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_type VARCHAR(100) NOT NULL,
    aggregate_id   UUID NOT NULL,
    event_type     VARCHAR(100) NOT NULL,
    payload        JSONB NOT NULL,
    status         VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                   CHECK (status IN ('PENDING','PROCESSING','SENT','FAILED')),
    retry_count    INTEGER NOT NULL DEFAULT 0,
    max_retries    INTEGER NOT NULL DEFAULT 3,
    error_message  VARCHAR(500),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at   TIMESTAMPTZ
);

CREATE INDEX idx_outbox_status     ON outbox_events(status, created_at) WHERE status IN ('PENDING','FAILED');
CREATE INDEX idx_outbox_aggregate  ON outbox_events(aggregate_type, aggregate_id);
