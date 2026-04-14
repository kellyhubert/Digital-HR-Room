import mongoose, { Schema, Document } from 'mongoose';

export interface IInterviewQuestion {
  questionId: string;
  text: string;
  category: 'technical' | 'behavioural' | 'situational';
}

export interface IInterview extends Document {
  jobId: mongoose.Types.ObjectId;
  screeningResultId: mongoose.Types.ObjectId;
  status: 'pending' | 'generating' | 'active' | 'evaluating' | 'completed' | 'failed';
  questions: IInterviewQuestion[];
  totalInvited: number;
  totalSubmitted: number;
  totalEvaluated: number;
  geminiModel: string;
  promptTokensUsed: number;
  responseTokensUsed: number;
  processingTimeMs: number;
  errorMessage: string | null;
  launchedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const InterviewQuestionSchema = new Schema<IInterviewQuestion>(
  {
    questionId: { type: String, required: true },
    text:       { type: String, required: true },
    category:   { type: String, enum: ['technical', 'behavioural', 'situational'], required: true },
  },
  { _id: false }
);

const InterviewSchema = new Schema<IInterview>(
  {
    jobId:             { type: Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    screeningResultId: { type: Schema.Types.ObjectId, ref: 'ScreeningResult', required: true },
    status:            { type: String, enum: ['pending', 'generating', 'active', 'evaluating', 'completed', 'failed'], default: 'pending' },
    questions:         [InterviewQuestionSchema],
    totalInvited:      { type: Number, default: 0 },
    totalSubmitted:    { type: Number, default: 0 },
    totalEvaluated:    { type: Number, default: 0 },
    geminiModel:       { type: String, default: '' },
    promptTokensUsed:  { type: Number, default: 0 },
    responseTokensUsed:{ type: Number, default: 0 },
    processingTimeMs:  { type: Number, default: 0 },
    errorMessage:      { type: String, default: null },
    launchedAt:        { type: Date, default: null },
    completedAt:       { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model<IInterview>('Interview', InterviewSchema);
