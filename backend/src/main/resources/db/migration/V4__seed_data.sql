-- V4: Seed data for development
-- Migration: V4__seed_data.sql
-- NOTE: Passwords are bcrypt hashes. Plaintext values are for dev only:
--   admin@hireai.com    -> Admin@123
--   recruiter@tech.com  -> Recruiter@123
--   candidate@mail.com  -> Candidate@123

INSERT INTO users (id, email, password_hash, role, status, email_verified) VALUES
    ('00000000-0000-0000-0000-000000000001', 'admin@hireai.com',
     '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPjCOvMYRXiy2', 'ADMIN', 'ACTIVE', true),
    ('00000000-0000-0000-0000-000000000002', 'recruiter@techcorp.com',
     '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lH9y', 'RECRUITER', 'ACTIVE', true),
    ('00000000-0000-0000-0000-000000000003', 'jane@candidate.com',
     '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lH9y', 'CANDIDATE', 'ACTIVE', true);

INSERT INTO skills (id, name, category) VALUES
    ('10000000-0000-0000-0000-000000000001', 'Java',            'Backend'),
    ('10000000-0000-0000-0000-000000000002', 'Spring Boot',     'Backend'),
    ('10000000-0000-0000-0000-000000000003', 'React',           'Frontend'),
    ('10000000-0000-0000-0000-000000000004', 'TypeScript',      'Frontend'),
    ('10000000-0000-0000-0000-000000000005', 'PostgreSQL',      'Database'),
    ('10000000-0000-0000-0000-000000000006', 'Docker',          'DevOps'),
    ('10000000-0000-0000-0000-000000000007', 'Python',          'Backend'),
    ('10000000-0000-0000-0000-000000000008', 'AWS',             'Cloud'),
    ('10000000-0000-0000-0000-000000000009', 'Kubernetes',      'DevOps'),
    ('10000000-0000-0000-0000-000000000010', 'Machine Learning','AI/ML'),
    ('10000000-0000-0000-0000-000000000011', 'REST API',        'Backend'),
    ('10000000-0000-0000-0000-000000000012', 'Git',             'Tools'),
    ('10000000-0000-0000-0000-000000000013', 'Node.js',         'Backend'),
    ('10000000-0000-0000-0000-000000000014', 'Redis',           'Database'),
    ('10000000-0000-0000-0000-000000000015', 'Microservices',   'Architecture');

INSERT INTO companies (id, name, slug, description, industry, size_range, headquarters, verification_status) VALUES
    ('20000000-0000-0000-0000-000000000001', 'TechCorp Inc.', 'techcorp-inc',
     'A leading technology company building scalable software solutions.',
     'Technology', '51-200', 'San Francisco, CA', 'VERIFIED'),
    ('20000000-0000-0000-0000-000000000002', 'StartupXYZ', 'startupxyz',
     'An innovative startup disrupting the fintech space.',
     'Fintech', '1-10', 'New York, NY', 'PENDING');

INSERT INTO recruiter_profiles (id, user_id, company_id, full_name, title) VALUES
    ('30000000-0000-0000-0000-000000000001',
     '00000000-0000-0000-0000-000000000002',
     '20000000-0000-0000-0000-000000000001',
     'Alex Recruiter', 'Senior Technical Recruiter');

INSERT INTO candidate_profiles (id, user_id, full_name, headline, location, total_experience_years, open_to_work) VALUES
    ('40000000-0000-0000-0000-000000000001',
     '00000000-0000-0000-0000-000000000003',
     'Jane Candidate', 'Full Stack Java Developer | Spring Boot | React',
     'Bengaluru, India', 3.0, true);

INSERT INTO candidate_skills (candidate_id, skill_id, proficiency, years) VALUES
    ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'ADVANCED', 3.0),
    ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'ADVANCED', 2.5),
    ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'INTERMEDIATE', 2.0),
    ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', 'INTERMEDIATE', 2.0);

INSERT INTO jobs (id, company_id, recruiter_id, title, description, responsibilities, employment_type, location, remote_type, min_experience_years, max_experience_years, salary_min, salary_max, salary_currency, status, published_at) VALUES
    ('50000000-0000-0000-0000-000000000001',
     '20000000-0000-0000-0000-000000000001',
     '30000000-0000-0000-0000-000000000001',
     'Senior Java Backend Engineer',
     'We are looking for a Senior Java Backend Engineer to join our platform team. You will build and maintain high-throughput microservices using Spring Boot and deploy on AWS.',
     'Design and implement RESTful APIs\nWrite unit and integration tests\nParticipate in code reviews\nCollaborate with frontend and DevOps teams',
     'FULL_TIME', 'San Francisco, CA', 'HYBRID', 4, 8,
     120000, 180000, 'USD', 'PUBLISHED', NOW() - INTERVAL '5 days'),
    ('50000000-0000-0000-0000-000000000002',
     '20000000-0000-0000-0000-000000000001',
     '30000000-0000-0000-0000-000000000001',
     'React Frontend Developer',
     'Join our product team to build beautiful, performant UIs using React and TypeScript.',
     'Build React components and pages\nIntegrate with REST APIs\nWrite frontend tests\nOptimize for performance and accessibility',
     'FULL_TIME', 'Remote', 'REMOTE', 2, 5,
     90000, 140000, 'USD', 'PUBLISHED', NOW() - INTERVAL '2 days');

INSERT INTO job_skills (job_id, skill_id, required) VALUES
    ('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', true),
    ('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', true),
    ('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', true),
    ('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000006', false),
    ('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000015', false),
    ('50000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', true),
    ('50000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', true),
    ('50000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000011', false);
