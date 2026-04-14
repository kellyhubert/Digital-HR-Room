import mongoose, { Schema, Document } from 'mongoose';

export interface IInterviewScoreBreakdown {
  communication: number;
  technicalDepth: number;
  problemSolving: number;
  cultureFit: number;
}

export interface IInterviewSession extends Document {
  interviewId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  applicantId: mongoose.Types.ObjectId;
  screeningRank: number;
  token: string;
  tokenExpiresAt: Date;
  status: 'invited' | 'in_progress' | 'submitted' | 'evaluated' | 'expired';
  startedAt: Date | null;
  submittedAt: Date | null;
  evaluatedAt: Date | null;
  interviewScore: number | null;
  scoreBreakdown: IInterviewScoreBreakdown | null;
  recommendation: string | null;
  geminiReasoning: string | null;
  advancedToFinal: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const InterviewScoreBreakdownSchema = new Schema<IInterviewScoreBreakdown>(
  {
    communication:  { type: Number, required: true },
    technicalDepth: { type: Number, required: true },
    problemSolving: { type: Number, required: true },
    cultureFit:     { type: Number, required: true },
  },
  { _id: false }
);

const InterviewSessionSchema = new Schema<IInterviewSession>(
  {
    interviewId:    { type: Schema.Types.ObjectId, ref: 'Interview', required: true, index: true },
    jobId:          { type: Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    applicantId:    { type: Schema.Types.ObjectId, ref: 'Applicant', required: true },
    screeningRank:  { type: Number, required: true },
    token:          { type: String, required: true, unique: true },
    tokenExpiresAt: { type: Date, required: true },
    status:         { type: String, enum: ['invited', 'in_progress', 'submitted', 'evaluated', 'expired'], default: 'invited' },
    startedAt:      { type: Date, default: null },
    submittedAt:    { type: Date, default: null },
    evaluatedAt:    { type: Date, default: null },
    interviewScore: { type: Number, default: null },
    scoreBreakdown: { type: InterviewScoreBreakdownSchema, default: null },
    recommendation: { type: String, default: null },
    geminiReasoning:{ type: String, default: null },
    advancedToFinal:{ type: Boolean, default: false },
  },
  { timestamps: true }
);

InterviewSessionSchema.index({ interviewId: 1, applicantId: 1 }, { unique: true });

export default mongoose.model<IInterviewSession>('InterviewSession', InterviewSessionSchema);
