export type Stage = 'APPLIED' | 'SCREENING' | 'SCREENED_OUT' | 'ASSESSMENT' | 'EVALUATING' | 'INTERVIEW' | 'HIRED' | 'REJECTED';

export interface Tenant {
  id: string;
  name: string;
  email: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'HR';
}

export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string;
  department?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  isActive: boolean;
  tenantId: string;
  _count?: { candidates: number };
  createdAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  stage: Stage;
  screeningScore?: number;
  screeningNotes?: string;
  screeningData?: any;
  jobId: string;
  job?: Job;
  assessment?: Assessment;
  evaluation?: Evaluation;
  interviewToken?: string;
  interviewScore?: number;
  createdAt: string;
}

export interface Assessment {
  id: string;
  token: string;
  questions: Question[];
  submitted: boolean;
  answers?: Answer[];
}

export interface Question {
  id: number;
  question: string;
  type: string;
  maxScore: number;
}

export interface Answer {
  questionId: number;
  answer: string;
}

export interface Evaluation {
  id: string;
  scores: any[];
  totalScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
}

export interface AuthState {
  token: string | null;
  user: User | null;
  tenantId: string | null;
  companyName: string | null;
}
