import axios from 'axios';
import { config } from '../config/env';
import { IJob } from '../models/Job.model';

export interface CandidateInput {
  applicantId: string;
  name: string;
  skills: string[];
  totalExperienceYears: number;
  experience: { title: string; company: string; durationMonths: number; description: string }[];
  education: { degree: string; field: string; institution: string; graduationYear: number }[];
  location: string;
  availability: string;
  portfolio: string | null;
  summary: string | null;
}

export interface AIScreeningRequest {
  job: {
    title: string;
    description: string;
    requiredSkills: string[];
    preferredSkills: string[];
    minExperienceYears: number;
    educationRequirement: string;
    location: string;
    weights: { skills: number; experience: number; education: number; relevance: number };
  };
  candidates: CandidateInput[];
  topN: number;
}

export interface CandidateScreenResult {
  applicantId: string;
  rank: number;
  overallScore: number;
  scoreBreakdown: { skills: number; experience: number; education: number; relevance: number };
  strengths: string[];
  gaps: string[];
  recommendation: string;
  geminiReasoning: string;
}

export interface AIScreeningResponse {
  shortlisted: CandidateScreenResult[];
  totalEvaluated: number;
  geminiModel: string;
  promptTokensUsed: number;
  responseTokensUsed: number;
}

// ─── Interview interfaces ────────────────────────────────────────────────────

export interface AIQuestionGenRequest {
  job: {
    title: string;
    description: string;
    requiredSkills: string[];
    preferredSkills: string[];
    minExperienceYears: number;
  };
  questionCount: number;
}

export interface GeneratedQuestion {
  questionId: string;
  text: string;
  category: string;
}

export interface AIQuestionGenResponse {
  questions: GeneratedQuestion[];
  geminiModel: string;
  promptTokensUsed: number;
  responseTokensUsed: number;
}

export interface AIEvaluationRequest {
  job: {
    title: string;
    description: string;
    requiredSkills: string[];
    preferredSkills: string[];
    minExperienceYears: number;
  };
  candidate: {
    name: string;
    skills: string[];
    totalExperienceYears: number;
    summary: string | null;
  };
  questions: GeneratedQuestion[];
  answers: { questionId: string; answerText: string }[];
}

export interface AIEvaluationResponse {
  interviewScore: number;
  scoreBreakdown: {
    communication: number;
    technicalDepth: number;
    problemSolving: number;
    cultureFit: number;
  };
  recommendation: string;
  geminiReasoning: string;
  geminiModel: string;
  promptTokensUsed: number;
  responseTokensUsed: number;
}

export async function generateInterviewQuestions(
  job: IJob,
  questionCount = 5
): Promise<AIQuestionGenResponse> {
  const payload: AIQuestionGenRequest = {
    job: {
      title: job.title,
      description: job.description,
      requiredSkills: job.requiredSkills,
      preferredSkills: job.preferredSkills,
      minExperienceYears: job.minExperienceYears,
    },
    questionCount,
  };

  const response = await axios.post<AIQuestionGenResponse>(
    `${config.aiServiceUrl}/interview/generate-questions`,
    payload,
    { timeout: 60000 }
  );

  return response.data;
}

export async function evaluateInterviewAnswers(
  job: IJob,
  candidate: { name: string; skills: string[]; totalExperienceYears: number; summary: string | null },
  questions: GeneratedQuestion[],
  answers: { questionId: string; answerText: string }[]
): Promise<AIEvaluationResponse> {
  const payload: AIEvaluationRequest = {
    job: {
      title: job.title,
      description: job.description,
      requiredSkills: job.requiredSkills,
      preferredSkills: job.preferredSkills,
      minExperienceYears: job.minExperienceYears,
    },
    candidate,
    questions,
    answers,
  };

  const response = await axios.post<AIEvaluationResponse>(
    `${config.aiServiceUrl}/interview/evaluate`,
    payload,
    { timeout: 120000 }
  );

  return response.data;
}

// ─── Screening ───────────────────────────────────────────────────────────────

export async function runAIScreening(
  job: IJob,
  candidates: CandidateInput[],
  topN: number
): Promise<AIScreeningResponse> {
  const payload: AIScreeningRequest = {
    job: {
      title: job.title,
      description: job.description,
      requiredSkills: job.requiredSkills,
      preferredSkills: job.preferredSkills,
      minExperienceYears: job.minExperienceYears,
      educationRequirement: job.educationRequirement,
      location: job.location,
      weights: job.weights,
    },
    candidates,
    topN,
  };

  const response = await axios.post<AIScreeningResponse>(
    `${config.aiServiceUrl}/screen`,
    payload,
    { timeout: 120000 } // 2 min timeout for large batches
  );

  return response.data;
}
