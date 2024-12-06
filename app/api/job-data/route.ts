// app/api/job-data/route.ts

import { NextResponse } from 'next/server';
import { JobData } from '@/types/JobData'; // Adjust the path if necessary

// In-memory store for job postings.
// Note: Data will be lost when the server restarts.
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
