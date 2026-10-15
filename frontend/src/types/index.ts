export type UserRole = 'CANDIDATE' | 'RECRUITER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userId: string;
  email: string;
  role: UserRole;
  fullName: string;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  industry?: string;
  headquarters?: string;
  description?: string;
  website?: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

export interface Job {
  id: string;
  title: string;
  company: Company;
  description?: string;
  responsibilities?: string;
  requirements?: string;
  benefits?: string;
  location?: string;
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE';
  remoteType: 'ONSITE' | 'REMOTE' | 'HYBRID';
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  minExperienceYears?: number;
  maxExperienceYears?: number;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';
  publishedAt?: string;
  applicationsCount: number;
  viewsCount?: number;
}

export interface Resume {
  id: string;
  candidateId: string;
  filename: string;
  originalFilename: string;
  contentType: string;
  fileSizeBytes: number;
  processingStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  extractedTextSnippet?: string;
  extractedText?: string;
  isPrimary: boolean;
  label?: string;
  createdAt: string;
}

export type ApplicationStatus =
  | 'APPLIED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'INTERVIEW_SCHEDULED'
  | 'OFFERED'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  companyLogoUrl?: string;
  candidateId: string;
  candidateName: string;
  candidateEmail?: string;
  resumeId?: string;
  resumeFilename?: string;
  status: ApplicationStatus;
  matchScore?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface AiMatchResult {
  overallMatchScore: number;
  skillsMatchScore: number;
  experienceMatchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  recommendations: string[];
  fitSummary: string;
}

export interface InterviewQuestion {
  category: string;
  question: string;
  context: string;
  tips: string;
}

export interface InterviewPrepResult {
  jobTitle: string;
  questions: InterviewQuestion[];
  preparationChecklist: string[];
}
