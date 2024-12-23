// app/api/job-data/route.ts

import { connectToDatabase } from '@/lib/database';
import { HireApplication } from '@/lib/database/models/HireApplication';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const AUTHORIZED_USER_ID = "user_2phMQ0jMweuG1r3t18YySLXCf4A";

export async function GET(request: Request) {
  try {
    const user = await currentUser();

    if (!user || user.id !== AUTHORIZED_USER_ID) {
      console.warn(`Unauthorized access attempt by user ID: ${user?.id}`);
      return NextResponse.json(
        { message: 'Unauthorized access.' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const jobId = url.searchParams.get('jobId');

    if (!jobId) {
      console.warn(`No jobId provided in request: ${request.url}`);
      return NextResponse.json(
        { message: 'Job ID is required.' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    console.log(`Connected to the database for fetching job data.`);

    const jobApplication = await HireApplication.findOne({ jobId });

    if (!jobApplication) {
      console.warn(`Job application not found for jobId: ${jobId}`);
      return NextResponse.json(
        { message: 'Job not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { jobData: jobApplication },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching job data:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { message: 'Failed to fetch job data.', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
