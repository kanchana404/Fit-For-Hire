// lib/database/models/HireApplication.ts

import mongoose, { Schema, Document, Model } from 'mongoose';

export type ApplicationStatus = 'published' | 'review' | 'reject' | 'ready_to_interview';

export interface IHireApplication extends Document {
  jobId: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  email: string; // Applicant's email
  tags: string[];
  status: ApplicationStatus;
  userId: string; // Clerk user ID who submitted the application
  postedAt: Date; // Timestamp when the status was updated
}

const HireApplicationSchema: Schema<IHireApplication> = new Schema({
  jobId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, required: true },
  salary: { type: String, required: true },
  description: { type: String, required: true },
  requirements: { type: [String], default: [] },
  email: { type: String, required: true },
  tags: { type: [String], default: [] },
  status: { type: String, enum: ['published', 'review', 'reject', 'ready_to_interview'], default: 'review' },
  userId: { type: String, required: true }, // Clerk user ID
  postedAt: { type: Date, default: Date.now }, // Initialize with current date
});

export const HireApplication: Model<IHireApplication> =
  mongoose.models.HireApplication || mongoose.model<IHireApplication>("HireApplication", HireApplicationSchema);
