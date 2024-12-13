// models/JobApplication.ts

import mongoose, { Schema, Document, Model } from "mongoose";

// Define the interface for a Job Application
export interface IJobApplication extends Document {
  job: mongoose.Types.ObjectId; // Reference to the Job
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  resumeUrl: string;
  submittedAt: Date;
}

// Define the Job Application Schema
const JobApplicationSchema: Schema<IJobApplication> = new Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  zipCode: { type: String },
  resumeUrl: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
});

// Export the JobApplication model
export const JobApplication: Model<IJobApplication> =
  mongoose.models.JobApplication ||
  mongoose.model<IJobApplication>("JobApplication", JobApplicationSchema);
