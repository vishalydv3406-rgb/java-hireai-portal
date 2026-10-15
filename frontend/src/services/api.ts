import axios from 'axios';
import { AuthResponse, Job, Resume, Application, AiMatchResult, InterviewPrepResult, Company } from '../types';
import { mockJobs, mockCompanies, mockResumes, mockApplications } from './mockData';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 3000, // Quick timeout to fall back to mock data if backend server is not running
});

// Interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hireai_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// In-memory mock store that initializes from localStorage or defaults
const getStoredJobs = (): Job[] => {
  const s = localStorage.getItem('hireai_mock_jobs');
  return s ? JSON.parse(s) : mockJobs;
};
const setStoredJobs = (jobs: Job[]) => {
  localStorage.setItem('hireai_mock_jobs', JSON.stringify(jobs));
};

const getStoredResumes = (): Resume[] => {
  const s = localStorage.getItem('hireai_mock_resumes');
  return s ? JSON.parse(s) : mockResumes;
};
const setStoredResumes = (resumes: Resume[]) => {
  localStorage.setItem('hireai_mock_resumes', JSON.stringify(resumes));
};

const getStoredApps = (): Application[] => {
  const s = localStorage.getItem('hireai_mock_apps');
  return s ? JSON.parse(s) : mockApplications;
};
const setStoredApps = (apps: Application[]) => {
  localStorage.setItem('hireai_mock_apps', JSON.stringify(apps));
};

export const authApi = {
  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    try {
      const res = await api.post<AuthResponse>('/auth/login', data);
      return res.data;
    } catch {
      // Offline / fallback mock auth
      const isCandidate = data.email.includes('candidate');
      return {
        accessToken: 'mock_jwt_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now(),
        tokenType: 'Bearer',
        expiresIn: 900,
        userId: isCandidate ? 'u-candidate' : 'u-recruiter',
        email: data.email,
        role: isCandidate ? 'CANDIDATE' : 'RECRUITER',
        fullName: isCandidate ? 'Alex Rivera (Staff Engineer)' : 'Sarah Jenkins (Tech Recruiter)',
      };
    }
  },
  register: async (data: any): Promise<AuthResponse> => {
    try {
      const res = await api.post<AuthResponse>('/auth/register', data);
      return res.data;
    } catch {
      return {
        accessToken: 'mock_jwt_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now(),
        tokenType: 'Bearer',
        expiresIn: 900,
        userId: 'u-' + Date.now(),
        email: data.email,
        role: data.role,
        fullName: data.fullName || 'User',
      };
    }
  },
  refresh: async (refreshToken: string) => {
    const res = await api.post<AuthResponse>('/auth/refresh', { refreshToken });
    return res.data;
  },
};

export const jobsApi = {
  search: async (params?: Record<string, any>) => {
    try {
      const res = await api.get<{ content: Job[]; totalElements: number; totalPages: number }>('/jobs', { params });
      return res.data;
    } catch {
      let filtered = [...getStoredJobs()];
      if (params?.keyword) {
        const kw = params.keyword.toLowerCase();
        filtered = filtered.filter(
          (j) =>
            j.title.toLowerCase().includes(kw) ||
            j.description?.toLowerCase().includes(kw) ||
            j.company?.name.toLowerCase().includes(kw)
        );
      }
      if (params?.location) {
        const loc = params.location.toLowerCase();
        filtered = filtered.filter((j) => j.location?.toLowerCase().includes(loc));
      }
      if (params?.remoteType) {
        filtered = filtered.filter((j) => j.remoteType === params.remoteType);
      }
      if (params?.employmentType) {
        filtered = filtered.filter((j) => j.employmentType === params.employmentType);
      }
      return { content: filtered, totalElements: filtered.length, totalPages: 1 };
    }
  },
  getById: async (id: string) => {
    try {
      const res = await api.get<Job>(`/jobs/${id}`);
      return res.data;
    } catch {
      const found = getStoredJobs().find((j) => j.id === id);
      if (!found) throw new Error('Job not found');
      return found;
    }
  },
  create: async (data: any) => {
    try {
      const res = await api.post<Job>('/recruiter/jobs', data);
      return res.data;
    } catch {
      const newJob: Job = {
        id: 'j-' + Date.now(),
        title: data.title,
        company: mockCompanies[0],
        description: data.description,
        responsibilities: data.responsibilities,
        requirements: data.requirements,
        location: data.location,
        remoteType: data.remoteType,
        employmentType: data.employmentType,
        salaryMin: data.salaryMin,
        salaryMax: data.salaryMax,
        minExperienceYears: data.minExperienceYears,
        status: 'PUBLISHED',
        publishedAt: new Date().toISOString(),
        applicationsCount: 0,
        viewsCount: 1,
      };
      const jobs = [newJob, ...getStoredJobs()];
      setStoredJobs(jobs);
      return newJob;
    }
  },
  update: async (id: string, data: any) => {
    const res = await api.put<Job>(`/recruiter/jobs/${id}`, data);
    return res.data;
  },
  changeStatus: async (id: string, status: string) => {
    try {
      const res = await api.patch(`/recruiter/jobs/${id}/status?status=${status}`);
      return res.data;
    } catch {
      const jobs = getStoredJobs().map((j) => (j.id === id ? { ...j, status: status as any } : j));
      setStoredJobs(jobs);
      return { success: true };
    }
  },
  getMyJobs: async (params?: Record<string, any>) => {
    try {
      const res = await api.get<{ content: Job[]; totalElements: number; totalPages: number }>('/recruiter/jobs', { params });
      return res.data;
    } catch {
      const jobs = getStoredJobs();
      return { content: jobs, totalElements: jobs.length, totalPages: 1 };
    }
  },
};

export const resumesApi = {
  getMyResumes: async () => {
    try {
      const res = await api.get<Resume[]>('/candidate/resumes');
      return res.data;
    } catch {
      return getStoredResumes();
    }
  },
  getDetail: async (id: string) => {
    try {
      const res = await api.get<Resume>(`/candidate/resumes/${id}`);
      return res.data;
    } catch {
      const r = getStoredResumes().find((x) => x.id === id);
      if (!r) throw new Error('Resume not found');
      return r;
    }
  },
  upload: async (file: File, label?: string, primary?: boolean) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (label) formData.append('label', label);
      if (primary) formData.append('primary', String(primary));
      const res = await api.post<Resume>('/candidate/resumes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch {
      const newResume: Resume = {
        id: 'r-' + Date.now(),
        candidateId: 'u-candidate',
        filename: file.name,
        originalFilename: file.name,
        contentType: file.type || 'application/pdf',
        fileSizeBytes: file.size,
        processingStatus: 'COMPLETED',
        extractedTextSnippet: 'Parsed resume: ' + file.name + ' with technical skills: Java, Spring Boot, React...',
        extractedText: 'Extracted resume text for ' + file.name + '.\nSkills: Java 21, Spring Boot 3, React, TypeScript, Docker.',
        isPrimary: primary ?? false,
        label: label || 'Uploaded CV',
        createdAt: new Date().toISOString(),
      };
      const list = [newResume, ...getStoredResumes()];
      setStoredResumes(list);
      return newResume;
    }
  },
  setPrimary: async (id: string) => {
    try {
      const res = await api.patch(`/candidate/resumes/${id}/primary`);
      return res.data;
    } catch {
      const list = getStoredResumes().map((r) => ({ ...r, isPrimary: r.id === id }));
      setStoredResumes(list);
      return { success: true };
    }
  },
  delete: async (id: string) => {
    try {
      const res = await api.delete(`/candidate/resumes/${id}`);
      return res.data;
    } catch {
      const list = getStoredResumes().filter((r) => r.id !== id);
      setStoredResumes(list);
      return { success: true };
    }
  },
};

export const applicationsApi = {
  apply: async (data: { jobId: string; resumeId?: string; coverLetter?: string }) => {
    try {
      const res = await api.post<Application>('/candidate/applications', data);
      return res.data;
    } catch {
      const job = getStoredJobs().find((j) => j.id === data.jobId);
      const newApp: Application = {
        id: 'a-' + Date.now(),
        jobId: data.jobId,
        jobTitle: job?.title || 'Senior Software Engineer',
        companyName: job?.company?.name || 'Acme Cloud Systems',
        candidateId: 'u-candidate',
        candidateName: 'Alex Rivera',
        candidateEmail: 'candidate@hireai.dev',
        resumeId: data.resumeId,
        resumeFilename: 'Alex_Rivera_Staff_Engineer_Resume.pdf',
        status: 'APPLIED',
        matchScore: 92.5,
        createdAt: new Date().toISOString(),
      };
      const apps = [newApp, ...getStoredApps()];
      setStoredApps(apps);
      // Increment applications count
      const updatedJobs = getStoredJobs().map((j) =>
        j.id === data.jobId ? { ...j, applicationsCount: j.applicationsCount + 1 } : j
      );
      setStoredJobs(updatedJobs);
      return newApp;
    }
  },
  getMyApplications: async (params?: Record<string, any>) => {
    try {
      const res = await api.get<{ content: Application[]; totalElements: number; totalPages: number }>('/candidate/applications', { params });
      return res.data;
    } catch {
      const apps = getStoredApps();
      return { content: apps, totalElements: apps.length, totalPages: 1 };
    }
  },
  getRecruiterApplications: async (params?: { jobId?: string; page?: number; size?: number }) => {
    try {
      const res = await api.get<{ content: Application[]; totalElements: number; totalPages: number }>('/recruiter/applications', { params });
      return res.data;
    } catch {
      let apps = getStoredApps();
      if (params?.jobId) {
        apps = apps.filter((a) => a.jobId === params.jobId);
      }
      return { content: apps, totalElements: apps.length, totalPages: 1 };
    }
  },
  updateStatus: async (id: string, data: { status: string; notes?: string }) => {
    try {
      const res = await api.patch<Application>(`/recruiter/applications/${id}/status`, data);
      return res.data;
    } catch {
      const apps = getStoredApps().map((a) => (a.id === id ? { ...a, status: data.status as any } : a));
      setStoredApps(apps);
      return apps.find((a) => a.id === id)!;
    }
  },
};

export const aiApi = {
  match: async (data: { resumeId?: string; resumeText?: string; jobId?: string; jobTitle?: string; jobDescription?: string }): Promise<AiMatchResult> => {
    try {
      const res = await api.post<AiMatchResult>('/ai/match', data);
      return res.data;
    } catch {
      const safeResume = (data.resumeText || '').toLowerCase();
      const safeJob = ((data.jobTitle || '') + ' ' + (data.jobDescription || '')).toLowerCase();

      const commonSkills = ['Java', 'Spring Boot', 'PostgreSQL', 'Docker', 'Redis', 'Kubernetes', 'React', 'TypeScript', 'pgvector'];
      const matched = commonSkills.filter((s) => safeResume.includes(s.toLowerCase()) && safeJob.includes(s.toLowerCase()));
      const missing = commonSkills.filter((s) => !safeResume.includes(s.toLowerCase()) && safeJob.includes(s.toLowerCase()));

      const score = Math.min(96, Math.max(70, Math.round(((matched.length + 3) / (commonSkills.length + 1)) * 100)));
      return {
        overallMatchScore: score,
        skillsMatchScore: Math.min(98, score + 4),
        experienceMatchScore: Math.max(75, score - 3),
        matchedSkills: matched.length > 0 ? matched : ['Java', 'Spring Boot', 'PostgreSQL', 'Docker'],
        missingSkills: missing.length > 0 ? missing : ['Kubernetes', 'pgvector'],
        strengths: [
          'Strong alignment with target backend stack (Java, Spring Boot, SQL)',
          'Demonstrated track record of delivering resilient cloud services',
          'Well-structured experience matching seniority requirements',
        ],
        recommendations: [
          'Highlight direct exposure to high-scale container orchestration (Kubernetes)',
          'Quantify system latency reductions in recent role bullet points',
          'Link GitHub repositories demonstrating Spring AI or pgvector implementations',
        ],
        fitSummary: `Candidate shows exceptional ${score}% alignment for the ${data.jobTitle || 'target'} role. Core competencies in Java & Spring Boot match key qualifications.`,
      };
    }
  },
  interviewPrep: async (data: { resumeId?: string; resumeText?: string; jobTitle: string; jobDescription?: string }): Promise<InterviewPrepResult> => {
    try {
      const res = await api.post<InterviewPrepResult>('/ai/interview-prep', data);
      return res.data;
    } catch {
      return {
        jobTitle: data.jobTitle || 'Senior Software Engineer',
        questions: [
          {
            category: 'System Design & Concurrency',
            question: 'How do you design a low-latency Spring Boot API that processes thousands of concurrent requests without locking issues?',
            context: 'Evaluates knowledge of connection pool sizing (HikariCP), stateless JWT auth, and Redis read-through caching.',
            tips: 'Discuss connection pooling, Virtual Threads in Java 21, optimistic vs pessimistic locking in JPA, and distributed cache invalidation strategies.',
          },
          {
            category: 'Vector Search & Database',
            question: 'Explain the difference between HNSW and IVFFLAT indexing in pgvector for semantic search.',
            context: 'Targets high-scale AI retrieval systems where memory tradeoffs matter.',
            tips: 'Explain that HNSW builds a multi-layer graph with higher query accuracy and speed at the cost of higher build time and memory, whereas IVFFLAT partitions vectors into inverted lists.',
          },
          {
            category: 'Fault Tolerance & Resiliency',
            question: 'How do you safeguard your backend when external AI or object storage providers suffer outages?',
            context: 'Tests defensive programming and high-availability architecture.',
            tips: 'Detail Circuit Breaker patterns (Resilience4j), retries with exponential backoff, local filesystem fallback for resume storage, and graceful degradation.',
          },
          {
            category: 'Behavioral & Impact',
            question: 'Describe a situation where you identified and resolved a critical latency bottleneck in production.',
            context: 'Tests root-cause analysis, profiling, and composure.',
            tips: 'Use the STAR method. Mention correlation IDs (RequestIdFilter), profiling SQL queries, adding indexes, and measuring before/after response times.',
          },
        ],
        preparationChecklist: [
          'Review Java 21 virtual threads vs platform threads',
          'Be prepared to diagram your Spring Security filter chain',
          'Practice explaining cosine distance formula and vector indexing',
          'Prepare 2 technical questions for the hiring engineering team',
        ],
      };
    }
  },
  parseResume: async (text: string) => {
    try {
      const res = await api.post('/ai/parse-resume', text, { headers: { 'Content-Type': 'text/plain' } });
      return res.data;
    } catch {
      return {
        candidateName: 'Alex Rivera',
        email: 'alex.rivera@example.com',
        phone: '(555) 234-5678',
        headline: 'Staff Full-Stack Engineer',
        detectedSkills: ['Java', 'Spring Boot', 'PostgreSQL', 'Docker', 'React', 'TypeScript'],
        estimatedExperienceYears: 5,
        summaryPoints: ['Detected 6 technical skills', 'Extracted contact info successfully'],
      };
    }
  },
};

export const companiesApi = {
  getAll: async () => {
    try {
      const res = await api.get<{ content: Company[] }>('/companies');
      return res.data;
    } catch {
      return { content: mockCompanies };
    }
  },
};

export default api;
