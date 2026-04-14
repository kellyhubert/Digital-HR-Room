import mongoose, { Schema, Document } from 'mongoose';

export interface IScoreBreakdown {
  skills: number;
  experience: number;
  education: number;
  relevance: number;
}

export interface ICandidateResult {
  applicantId: mongoose.Types.ObjectId;
  rank: number;
  overallScore: number;
  scoreBreakdown: IScoreBreakdown;
  strengths: string[];
  gaps: string[];
  recommendation: string;
  geminiReasoning: string;
}

export interface IScreeningResult extends Document {
  jobId: mongoose.Types.ObjectId;
  scenario: 'umurava' | 'external';
  totalCandidatesEvaluated: number;
  shortlistedCount: number;
  results: ICandidateResult[];
  geminiModel: string;
  promptTokensUsed: number;
  responseTokensUsed: number;
  processingTimeMs: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage: string | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ScoreBreakdownSchema = new Schema<IScoreBreakdown>(
  {
    skills:     { type: Number, required: true },
    experience: { type: Number, required: true },
    education:  { type: Number, required: true },
    relevance:  { type: Number, required: true },
  },
  { _id: false }
);

const CandidateResultSchema = new Schema<ICandidateResult>(
  {
    applicantId:     { type: Schema.Types.ObjectId, ref: 'Applicant', required: true },
    rank:            { type: Number, required: true },
    overallScore:    { type: Number, required: true, min: 0, max: 100 },
    scoreBreakdown:  { type: ScoreBreakdownSchema, required: true },
    strengths:       [{ type: String }],
    gaps:            [{ type: String }],
    recommendation:  { type: String, required: true },
    geminiReasoning: { type: String, required: true },
  },
  { _id: false }
);

const ScreeningResultSchema = new Schema<IScreeningResult>(
  {
    jobId:                    { type: Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    scenario:                 { type: String, enum: ['umurava', 'external'], required: true },
    totalCandidatesEvaluated: { type: Number, required: true },
    shortlistedCount:         { type: Number, required: true },
    results:                  [CandidateResultSchema],
    geminiModel:              { type: String, default: 'gemini-1.5-pro' },
    promptTokensUsed:         { type: Number, default: 0 },
    responseTokensUsed:       { type: Number, default: 0 },
    processingTimeMs:         { type: Number, default: 0 },
    status:                   { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
    errorMessage:             { type: String, default: null },
    completedAt:              { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model<IScreeningResult>('ScreeningResult', ScreeningResultSchema);
