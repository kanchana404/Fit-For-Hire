// lib/database/models/Application.ts

import mongoose, { Schema, Document, Model } from 'mongoose';

export type ApplicationStatus = 'published' | 'review' | 'reject';

export interface IApplication extends Document {
  jobId: string;
  firstName: string;
  lastName: string;
  email: string; // Applicant's email
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  resumeUrl: string;
  jobTitle: string;
  jobCompany: string;
  jobEmail: string;
  status: ApplicationStatus;
  postedAt: Date; // Timestamp when the application was submitted
}

const ApplicationSchema: Schema<IApplication> = new Schema({
  jobId: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  zipCode: { type: String },
  resumeUrl: { type: String, required: true },
  jobTitle: { type: String, required: true },
  jobCompany: { type: String, required: true },
  jobEmail: { type: String, required: true },
  status: { type: String, enum: ['published', 'review', 'reject'], default: 'review' },
  postedAt: { type: Date, default: Date.now },
});

export const Application: Model<IApplication> =
  mongoose.models.Application || mongoose.model<IApplication>("Application", ApplicationSchema);
