// models/HireApplication.ts

import mongoose, { Schema, Document, Model } from 'mongoose';

export type ApplicationStatus = 'published' | 'review' | 'reject';

export interface IHireApplication extends Document {
  jobId: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  email: string;
  tags: string[];
  userId: string; // Reference to the User who posted
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const HireApplicationSchema: Schema<IHireApplication> = new Schema(
  {
    jobId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String },
    type: { type: String },
    salary: { type: String },
    description: { type: String },
    requirements: { type: [String], default: [] },
    email: { type: String, required: true },
    tags: { type: [String], default: [] },
    userId: { type: String, required: true, ref: 'User' },
    status: {
      type: String,
      enum: ['published', 'review', 'reject'],
      default: 'review',
    },
  },
  { timestamps: true }
);

export const HireApplication: Model<IHireApplication> =
  mongoose.models.HireApplication ||
  mongoose.model<IHireApplication>('HireApplication', HireApplicationSchema);
