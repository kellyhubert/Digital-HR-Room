import mongoose, { Schema, Document } from 'mongoose';

export interface IExperienceEntry {
  title: string;
  company: string;
  startDate: string;
  endDate: string | null;
  durationMonths: number;
  description: string;
}

export interface IEducationEntry {
  degree: string;
  field: string;
  institution: string;
  graduationYear: number;
}

export interface IApplicant extends Document {
  jobId: mongoose.Types.ObjectId;
  source: 'umurava' | 'external';
  externalId: string | null;
  name: string;
  email: string;
  phone: string | null;
  location: string;
  skills: string[];
  totalExperienceYears: number;
  experience: IExperienceEntry[];
  education: IEducationEntry[];
  portfolio: string | null;
  availability: 'immediate' | '2-weeks' | '1-month' | '3-months' | 'not-available';
  linkedIn: string | null;
  github: string | null;
  summary: string | null;
  rawText: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const ExperienceSchema = new Schema<IExperienceEntry>(
  {
    title:          { type: String, required: true },
    company:        { type: String, required: true },
    startDate:      { type: String, required: true },
    endDate:        { type: String, default: null },
    durationMonths: { type: Number, default: 0 },
    description:    { type: String, default: '' },
  },
  { _id: false }
);

const EducationSchema = new Schema<IEducationEntry>(
  {
    degree:         { type: String, required: true },
    field:          { type: String, default: '' },
    institution:    { type: String, required: true },
    graduationYear: { type: Number, required: true },
  },
  { _id: false }
);

const ApplicantSchema = new Schema<IApplicant>(
  {
    jobId:                { type: Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    source:               { type: String, enum: ['umurava', 'external'], required: true },
    externalId:           { type: String, default: null },
    name:                 { type: String, required: true },
    email:                { type: String, required: true },
    phone:                { type: String, default: null },
    location:             { type: String, default: '' },
    skills:               [{ type: String }],
    totalExperienceYears: { type: Number, default: 0 },
    experience:           [ExperienceSchema],
    education:            [EducationSchema],
    portfolio:            { type: String, default: null },
    availability:         { type: String, enum: ['immediate', '2-weeks', '1-month', '3-months', 'not-available'], default: 'not-available' },
    linkedIn:             { type: String, default: null },
    github:               { type: String, default: null },
    summary:              { type: String, default: null },
    rawText:              { type: String, default: null },
  },
  { timestamps: true }
);

ApplicantSchema.index({ jobId: 1, email: 1 }, { unique: true });

export default mongoose.model<IApplicant>('Applicant', ApplicantSchema);
