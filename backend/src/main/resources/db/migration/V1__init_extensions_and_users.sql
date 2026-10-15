-- V1: Enable pgvector extension and create core user tables
-- Migration: V1__init_extensions_and_users.sql

-- Enable pgvector for semantic search
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(320) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL CHECK (role IN ('CANDIDATE', 'RECRUITER', 'ADMIN')),
    status        VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION')),
    email_verified BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_users_email ON users (LOWER(email));
CREATE INDEX idx_users_role        ON users (role);
CREATE INDEX idx_users_status      ON users (status);

-- ============================================================
-- SKILLS (shared lookup table)
-- ============================================================
CREATE TABLE skills (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(100) NOT NULL,
    category   VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_skills_name ON skills (LOWER(name));

-- ============================================================
-- CANDIDATE PROFILES
-- ============================================================
CREATE TABLE candidate_profiles (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name             VARCHAR(200) NOT NULL,
    headline              VARCHAR(300),
    location              VARCHAR(200),
    about                 TEXT,
    phone                 VARCHAR(30),
    linkedin_url          VARCHAR(500),
    github_url            VARCHAR(500),
    portfolio_url         VARCHAR(500),
    preferred_locations   TEXT,          -- JSON array stored as text
    employment_type_pref  VARCHAR(50),   -- FULL_TIME | PART_TIME | CONTRACT | REMOTE
    open_to_work         BOOLEAN NOT NULL DEFAULT FALSE,
    total_experience_years DECIMAL(4,1),
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_candidate_profiles_user_id ON candidate_profiles(user_id);

-- Candidate skills
CREATE TABLE candidate_skills (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    skill_id     UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    proficiency  VARCHAR(20) CHECK (proficiency IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')),
    years        DECIMAL(3,1),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_candidate_skills_unique ON candidate_skills(candidate_id, skill_id);
CREATE INDEX idx_candidate_skills_skill_id      ON candidate_skills(skill_id);

-- Education
CREATE TABLE education (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    institution  VARCHAR(300) NOT NULL,
    degree       VARCHAR(200),
    field        VARCHAR(200),
    start_date   DATE,
    end_date     DATE,
    grade        VARCHAR(50),
    description  TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_education_candidate_id ON education(candidate_id);

-- Experience
CREATE TABLE experience (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    company      VARCHAR(300) NOT NULL,
    title        VARCHAR(300) NOT NULL,
    location     VARCHAR(200),
    start_date   DATE NOT NULL,
    end_date     DATE,
    current      BOOLEAN NOT NULL DEFAULT FALSE,
    description  TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_experience_candidate_id ON experience(candidate_id);

-- Projects
CREATE TABLE projects (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    name         VARCHAR(300) NOT NULL,
    description  TEXT,
    tech_stack   TEXT,          -- comma-separated or JSON
    repo_url     VARCHAR(500),
    live_url     VARCHAR(500),
    start_date   DATE,
    end_date     DATE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_candidate_id ON projects(candidate_id);

-- ============================================================
-- COMPANIES
-- ============================================================
CREATE TABLE companies (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name              VARCHAR(300) NOT NULL,
    slug              VARCHAR(300) NOT NULL,
    description       TEXT,
    website           VARCHAR(500),
    logo_url          VARCHAR(500),
    industry          VARCHAR(100),
    size_range        VARCHAR(50),  -- e.g. "1-10", "11-50", "51-200", "201-500", "500+"
    headquarters      VARCHAR(200),
    founded_year      INTEGER,
    verification_status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                        CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_companies_verification ON companies(verification_status);

-- ============================================================
-- RECRUITER PROFILES
-- ============================================================
CREATE TABLE recruiter_profiles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id  UUID REFERENCES companies(id) ON DELETE SET NULL,
    full_name   VARCHAR(200) NOT NULL,
    title       VARCHAR(200),
    phone       VARCHAR(30),
    linkedin_url VARCHAR(500),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_recruiter_profiles_user_id ON recruiter_profiles(user_id);
CREATE INDEX idx_recruiter_profiles_company_id     ON recruiter_profiles(company_id);
