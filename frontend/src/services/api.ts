import axios from 'axios';
import { AuthResponse, Job, Resume, Application, AiMatchResult, InterviewPrepResult, Company } from '../types';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hireai_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token if unauthorized
      // localStorage.removeItem('hireai_token');
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data).then((res) => res.data),
  register: (data: { email: string; password: string; role: string; fullName: string; companyName?: string }) =>
    api.post<AuthResponse>('/auth/register', data).then((res) => res.data),
  refresh: (refreshToken: string) =>
    api.post<AuthResponse>('/auth/refresh', { refreshToken }).then((res) => res.data),
};

export const jobsApi = {
  search: (params?: Record<string, any>) =>
    api.get<{ content: Job[]; totalElements: number; totalPages: number }>('/jobs', { params }).then((res) => res.data),
  getById: (id: string) =>
    api.get<Job>(`/jobs/${id}`).then((res) => res.data),
  create: (data: any) =>
    api.post<Job>('/recruiter/jobs', data).then((res) => res.data),
  update: (id: string, data: any) =>
    api.put<Job>(`/recruiter/jobs/${id}`, data).then((res) => res.data),
  changeStatus: (id: string, status: string) =>
    api.patch(`/recruiter/jobs/${id}/status?status=${status}`).then((res) => res.data),
  getMyJobs: (params?: Record<string, any>) =>
    api.get<{ content: Job[]; totalElements: number; totalPages: number }>('/recruiter/jobs', { params }).then((res) => res.data),
};

export const resumesApi = {
  getMyResumes: () =>
    api.get<Resume[]>('/candidate/resumes').then((res) => res.data),
  getDetail: (id: string) =>
    api.get<Resume>(`/candidate/resumes/${id}`).then((res) => res.data),
  upload: (file: File, label?: string, primary?: boolean) => {
    const formData = new FormData();
    formData.append('file', file);
    if (label) formData.append('label', label);
    if (primary) formData.append('primary', String(primary));
    return api.post<Resume>('/candidate/resumes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((res) => res.data);
  },
  setPrimary: (id: string) =>
    api.patch(`/candidate/resumes/${id}/primary`).then((res) => res.data),
  delete: (id: string) =>
    api.delete(`/candidate/resumes/${id}`).then((res) => res.data),
};

export const applicationsApi = {
  apply: (data: { jobId: string; resumeId?: string; coverLetter?: string }) =>
    api.post<Application>('/candidate/applications', data).then((res) => res.data),
  getMyApplications: (params?: Record<string, any>) =>
    api.get<{ content: Application[]; totalElements: number; totalPages: number }>('/candidate/applications', { params }).then((res) => res.data),
  getRecruiterApplications: (params?: { jobId?: string; page?: number; size?: number }) =>
    api.get<{ content: Application[]; totalElements: number; totalPages: number }>('/recruiter/applications', { params }).then((res) => res.data),
  updateStatus: (id: string, data: { status: string; notes?: string }) =>
    api.patch<Application>(`/recruiter/applications/${id}/status`, data).then((res) => res.data),
};

export const aiApi = {
  match: (data: { resumeId?: string; resumeText?: string; jobId?: string; jobTitle?: string; jobDescription?: string }) =>
    api.post<AiMatchResult>('/ai/match', data).then((res) => res.data),
  interviewPrep: (data: { resumeId?: string; resumeText?: string; jobTitle: string; jobDescription?: string }) =>
    api.post<InterviewPrepResult>('/ai/interview-prep', data).then((res) => res.data),
  parseResume: (text: string) =>
    api.post('/ai/parse-resume', text, { headers: { 'Content-Type': 'text/plain' } }).then((res) => res.data),
};

export const companiesApi = {
  getAll: () =>
    api.get<{ content: Company[] }>('/companies').then((res) => res.data),
};

export default api;
