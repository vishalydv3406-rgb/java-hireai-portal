-- V2: Jobs, Applications, Resumes
-- Migration: V2__jobs_applications_resumes.sql

-- ============================================================
-- JOBS
-- ============================================================
CREATE TABLE jobs (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id         UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    recruiter_id       UUID NOT NULL REFERENCES recruiter_profiles(id) ON DELETE RESTRICT,
    title              VARCHAR(300) NOT NULL,
    description        TEXT NOT NULL,
    responsibilities   TEXT,
    requirements       TEXT,
    benefits           TEXT,
    employment_type    VARCHAR(30) NOT NULL CHECK (employment_type IN ('FULL_TIME','PART_TIME','CONTRACT','INTERNSHIP','FREELANCE')),
    location           VARCHAR(300),
    remote_type        VARCHAR(20) NOT NULL DEFAULT 'ONSITE' CHECK (remote_type IN ('ONSITE','REMOTE','HYBRID')),
    min_experience_years INTEGER,
    max_experience_years INTEGER,
    salary_min         DECIMAL(12,2),
    salary_max         DECIMAL(12,2),
    salary_currency    VARCHAR(10) DEFAULT 'USD',
    status             VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
                       CHECK (status IN ('DRAFT','PUBLISHED','CLOSED','ARCHIVED')),
    published_at       TIMESTAMPTZ,
    closes_at          TIMESTAMPTZ,
    views_count        INTEGER NOT NULL DEFAULT 0,
    applications_count INTEGER NOT NULL DEFAULT 0,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_jobs_status          ON jobs(status);
CREATE INDEX idx_jobs_company_id      ON jobs(company_id);
CREATE INDEX idx_jobs_recruiter_id    ON jobs(recruiter_id);
CREATE INDEX idx_jobs_published_at    ON jobs(published_at DESC) WHERE status = 'PUBLISHED';
CREATE INDEX idx_jobs_employment_type ON jobs(employment_type);
CREATE INDEX idx_jobs_remote_type     ON jobs(remote_type);
CREATE INDEX idx_jobs_location        ON jobs(location);

-- Job skills
CREATE TABLE job_skills (
    id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id   UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    required BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE UNIQUE INDEX idx_job_skills_unique   ON job_skills(job_id, skill_id);
CREATE INDEX idx_job_skills_job_id          ON job_skills(job_id);
CREATE INDEX idx_job_skills_skill_id        ON job_skills(skill_id);

-- ============================================================
-- RESUMES
-- ============================================================
CREATE TABLE resumes (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id      UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    filename          VARCHAR(500) NOT NULL,
    original_filename VARCHAR(500) NOT NULL,
    storage_key       VARCHAR(1000) NOT NULL,  -- S3/MinIO object key
    content_type      VARCHAR(100) NOT NULL,
    file_size_bytes   BIGINT NOT NULL,
    processing_status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                      CHECK (processing_status IN ('PENDING','PROCESSING','COMPLETED','FAILED')),
    extracted_text    TEXT,
    processing_error  VARCHAR(500),
    retry_count       INTEGER NOT NULL DEFAULT 0,
    is_primary        BOOLEAN NOT NULL DEFAULT FALSE,
    label             VARCHAR(100),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_resumes_candidate_id      ON resumes(candidate_id);
CREATE INDEX idx_resumes_processing_status ON resumes(processing_status);

-- Resume skills (extracted by AI)
CREATE TABLE resume_skills (
    id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    skill_id  UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    source    VARCHAR(20) NOT NULL DEFAULT 'AI_EXTRACTED'
              CHECK (source IN ('AI_EXTRACTED','CANDIDATE_CONFIRMED'))
);

CREATE UNIQUE INDEX idx_resume_skills_unique ON resume_skills(resume_id, skill_id);

-- ============================================================
-- APPLICATIONS
-- ============================================================
CREATE TABLE applications (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id       UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    resume_id    UUID REFERENCES resumes(id) ON DELETE SET NULL,
    status       VARCHAR(30) NOT NULL DEFAULT 'APPLIED'
                 CHECK (status IN ('APPLIED','UNDER_REVIEW','SHORTLISTED','INTERVIEW_SCHEDULED','OFFERED','REJECTED','WITHDRAWN')),
    cover_letter TEXT,
    match_score  DECIMAL(5,2),
    notes        TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prevent duplicate applications
CREATE UNIQUE INDEX idx_applications_unique ON applications(job_id, candidate_id);
CREATE INDEX idx_applications_candidate_id  ON applications(candidate_id);
CREATE INDEX idx_applications_job_id        ON applications(job_id);
CREATE INDEX idx_applications_status        ON applications(status);

-- Application events (status change history)
CREATE TABLE application_events (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    old_status     VARCHAR(30),
    new_status     VARCHAR(30) NOT NULL,
    actor_id       UUID REFERENCES users(id),
    comment        TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_application_events_application_id ON application_events(application_id);
CREATE INDEX idx_application_events_created_at     ON application_events(created_at DESC);

-- ============================================================
-- SAVED JOBS
-- ============================================================
CREATE TABLE saved_jobs (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    job_id       UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_saved_jobs_unique ON saved_jobs(candidate_id, job_id);
CREATE INDEX idx_saved_jobs_candidate_id  ON saved_jobs(candidate_id);

-- ============================================================
-- INTERVIEWS
-- ============================================================
CREATE TABLE interviews (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    scheduled_at   TIMESTAMPTZ NOT NULL,
    duration_min   INTEGER NOT NULL DEFAULT 60,
    type           VARCHAR(30) NOT NULL DEFAULT 'VIDEO'
                   CHECK (type IN ('VIDEO','PHONE','ONSITE','TECHNICAL','HR')),
    status         VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED'
                   CHECK (status IN ('SCHEDULED','COMPLETED','CANCELLED','RESCHEDULED')),
    meeting_link   VARCHAR(1000),
    location       VARCHAR(500),
    notes          TEXT,
    feedback       TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_interviews_application_id ON interviews(application_id);
CREATE INDEX idx_interviews_scheduled_at   ON interviews(scheduled_at);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type       VARCHAR(50) NOT NULL,
    title      VARCHAR(300) NOT NULL,
    body       TEXT NOT NULL,
    read       BOOLEAN NOT NULL DEFAULT FALSE,
    entity_id  UUID,
    entity_type VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id    ON notifications(user_id);
CREATE INDEX idx_notifications_read       ON notifications(user_id, read) WHERE read = FALSE;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
