import mongoose, { Schema, Document } from 'mongoose';

export interface IInterviewResponse extends Document {
  sessionId: mongoose.Types.ObjectId;
  interviewId: mongoose.Types.ObjectId;
  questionId: string;
  answerText: string;
  wordCount: number;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InterviewResponseSchema = new Schema<IInterviewResponse>(
  {
    sessionId:   { type: Schema.Types.ObjectId, ref: 'InterviewSession', required: true, index: true },
    interviewId: { type: Schema.Types.ObjectId, ref: 'Interview', required: true },
    questionId:  { type: String, required: true },
    answerText:  { type: String, required: true },
    wordCount:   { type: Number, default: 0 },
    submittedAt: { type: Date, required: true },
  },
  { timestamps: true }
);

InterviewResponseSchema.index({ sessionId: 1, questionId: 1 }, { unique: true });

export default mongoose.model<IInterviewResponse>('InterviewResponse', InterviewResponseSchema);
