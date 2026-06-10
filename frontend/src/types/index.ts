export type Stage = 'APPLIED' | 'SCREENING' | 'SCREENED_OUT' | 'ASSESSMENT' | 'EVALUATING' | 'INTERVIEW' | 'INTERVIEW_EVALUATING' | 'FINAL_REVIEW' | 'HIRED' | 'REJECTED';

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
  interviewScore?: number;
  finalScore?: number;
  finalRanking?: number;
  hrDecision?: 'PENDING' | 'HIRED' | 'REJECTED';
  jobId: string;
  job?: Job;
  assessment?: Assessment;
  evaluation?: Evaluation;
  interviewReview?: InterviewReview;
  interviewToken?: string;
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

export interface InterviewReview {
  id: string;
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  answers: string[];
  communicationScore?: number;
  technicalScore?: number;
  professionalism?: number;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  tenantId: string | null;
  companyName: string | null;
}
