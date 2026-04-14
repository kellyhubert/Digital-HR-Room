export interface JobWeights {
  skills: number;
  experience: number;
  education: number;
  relevance: number;
}

export interface Job {
  _id: string;
  title: string;
  description: string;
  department: string;
  location: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
  requiredSkills: string[];
  preferredSkills: string[];
  minExperienceYears: number;
  educationRequirement: string;
  weights: JobWeights;
  topN: 10 | 20;
  status: 'draft' | 'active' | 'screening' | 'completed' | 'interviewing' | 'interview_completed' | 'closed';
  screeningScenario: 'umurava' | 'external' | null;
  createdAt: string;
  updatedAt: string;
}

export interface Applicant {
  _id: string;
  name: string;
  email: string;
  phone: string | null;
  location: string;
  skills: string[];
  totalExperienceYears: number;
  availability: string;
  portfolio: string | null;
  linkedIn: string | null;
  github: string | null;
  summary: string | null;
  source: 'umurava' | 'external';
}

export interface ScoreBreakdown {
  skills: number;
  experience: number;
  education: number;
  relevance: number;
}

export interface CandidateResult {
  applicantId: string;
  rank: number;
  overallScore: number;
  scoreBreakdown: ScoreBreakdown;
  strengths: string[];
  gaps: string[];
  recommendation: string;
  geminiReasoning: string;
  applicant: Applicant | null;
}

export interface ScreeningResult {
  _id: string;
  jobId: string;
  scenario: 'umurava' | 'external';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalCandidatesEvaluated: number;
  shortlistedCount: number;
  processingTimeMs: number;
  geminiModel: string;
  promptTokensUsed: number;
  responseTokensUsed: number;
  errorMessage: string | null;
  results: CandidateResult[];
  createdAt: string;
  completedAt: string | null;
}

export interface InterviewQuestion {
  questionId: string;
  text: string;
  category: 'technical' | 'behavioural' | 'situational';
}

export interface InterviewScoreBreakdown {
  communication: number;
  technicalDepth: number;
  problemSolving: number;
  cultureFit: number;
}

export interface InterviewSession {
  _id: string;
  interviewId: string;
  jobId: string;
  applicantId: string;
  screeningRank: number;
  token: string;
  tokenExpiresAt: string;
  status: 'invited' | 'in_progress' | 'submitted' | 'evaluated' | 'expired';
  startedAt: string | null;
  submittedAt: string | null;
  evaluatedAt: string | null;
  interviewScore: number | null;
  scoreBreakdown: InterviewScoreBreakdown | null;
  recommendation: string | null;
  geminiReasoning: string | null;
  advancedToFinal: boolean;
  applicant: { _id: string; name: string; email: string; skills: string[]; totalExperienceYears: number } | null;
}

export interface Interview {
  _id: string;
  jobId: string;
  screeningResultId: string;
  status: 'pending' | 'generating' | 'active' | 'evaluating' | 'completed' | 'failed';
  questions: InterviewQuestion[];
  totalInvited: number;
  totalSubmitted: number;
  totalEvaluated: number;
  geminiModel: string;
  promptTokensUsed: number;
  responseTokensUsed: number;
  processingTimeMs: number;
  errorMessage: string | null;
  launchedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface TalentFilter {
  skills?: string[];
  minExperienceYears?: number;
  location?: string;
  availability?: string[];
}
