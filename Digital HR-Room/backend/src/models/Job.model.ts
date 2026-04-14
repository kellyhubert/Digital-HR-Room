import mongoose, { Schema, Document } from 'mongoose';

export interface IJobWeights {
  skills: number;
  experience: number;
  education: number;
  relevance: number;
}

export interface IJob extends Document {
  title: string;
  description: string;
  department: string;
  location: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
  requiredSkills: string[];
  preferredSkills: string[];
  minExperienceYears: number;
  educationRequirement: string;
  weights: IJobWeights;
  topN: 10 | 20;
  status: 'draft' | 'active' | 'screening' | 'completed' | 'interviewing' | 'interview_completed' | 'closed';
  screeningScenario: 'umurava' | 'external' | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const JobWeightsSchema = new Schema<IJobWeights>(
  {
    skills:     { type: Number, required: true, min: 0, max: 100 },
    experience: { type: Number, required: true, min: 0, max: 100 },
    education:  { type: Number, required: true, min: 0, max: 100 },
    relevance:  { type: Number, required: true, min: 0, max: 100 },
  },
  { _id: false }
);

const JobSchema = new Schema<IJob>(
  {
    title:                { type: String, required: true, trim: true },
    description:          { type: String, required: true },
    department:           { type: String, required: true },
    location:             { type: String, required: true },
    employmentType:       { type: String, enum: ['full-time', 'part-time', 'contract', 'internship'], required: true },
    requiredSkills:       [{ type: String }],
    preferredSkills:      [{ type: String }],
    minExperienceYears:   { type: Number, default: 0 },
    educationRequirement: { type: String, default: '' },
    weights:              { type: JobWeightsSchema, required: true },
    topN:                 { type: Number, enum: [10, 20], default: 10 },
    status:               { type: String, enum: ['draft', 'active', 'screening', 'completed', 'interviewing', 'interview_completed', 'closed'], default: 'draft' },
    screeningScenario:    { type: String, enum: ['umurava', 'external', null], default: null },
    createdBy:            { type: String, default: 'recruiter' },
  },
  { timestamps: true }
);

export default mongoose.model<IJob>('Job', JobSchema);
