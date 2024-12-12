// models/Job.ts

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IJob extends Document {
  jobId: string; // Unique identifier for the job
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  posted: string; // clerkId of the user who posted the job
  tags: string[];
  email: string;
  postedAt: Date; // New field to store the approval timestamp
}

const JobSchema: Schema<IJob> = new Schema({
  jobId: { type: String, required: true, unique: true }, // Ensure jobId is unique
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, required: true },
  salary: { type: String, required: true },
  description: { type: String, required: true },
  requirements: { type: [String], default: [] },
  posted: { type: String, required: true }, // clerkId
  tags: { type: [String], default: [] },
  email: { type: String, required: true },
  postedAt: { type: Date, required: true, default: Date.now }, // Initialize with current date
});

export const Job: Model<IJob> =
  mongoose.models.Job || mongoose.model<IJob>("Job", JobSchema);
