// app/api/job-data/route.ts

import { NextResponse } from 'next/server';

// Define the JobData type
type JobData = {
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  email: string;
  tags: string[];
};

// In-memory store for job postings.
// Note: For production, consider using a persistent database.
const jobDataStore: Record<string, JobData> = {};

/**
 * Stores job data in the in-memory store.
 * @param jobId - Unique identifier for the job posting.
 * @param data - The job data to store.
 */
export function storeJobData(jobId: string, data: JobData) {
  jobDataStore[jobId] = data;
}

/**
 * Retrieves job data based on the provided jobId.
 * @param request - The incoming request containing query parameters.
 * @returns A JSON response with the job data or an error message.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  if (!jobId || !jobDataStore[jobId]) {
    return NextResponse.json({ message: 'Job not found' }, { status: 404 });
  }

  return NextResponse.json({ jobData: jobDataStore[jobId] }, { status: 200 });
}
