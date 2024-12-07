// app/api/update-job-status/route.ts

import { connectToDatabase } from '@/lib/database';
import { ApplicationStatus, HireApplication } from '@/lib/database/models/HireApplication';
import { Job } from '@/lib/database/models/Job';
import { currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server';

const AUTHORIZED_USER_ID = "user_2phMQ0jMweuG1r3t18YySLXCf4A";

export interface UpdateStatusPayload {
  jobId: string;
  status: ApplicationStatus;
}

export async function POST(request: Request) {
  try {
    const user = await currentUser();

    if (!user || user.id !== AUTHORIZED_USER_ID) {
      return NextResponse.json(
        { message: 'Unauthorized access.' },
        { status: 403 }
      );
    }

    // Ensure the request is in JSON format
    const payload: UpdateStatusPayload = await request.json();

    const { jobId, status } = payload;

    if (!jobId || !status) {
      return NextResponse.json(
        { message: 'Job ID and status are required.' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses: ApplicationStatus[] = ['published', 'review', 'reject'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { message: 'Invalid status value.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find the job application
    const jobApplication = await HireApplication.findOne({ jobId });

    if (!jobApplication) {
      return NextResponse.json(
        { message: 'Job application not found.' },
        { status: 404 }
      );
    }

    // Update the status
    jobApplication.status = status;
    await jobApplication.save();

    // If status is 'published', insert into Job collection
    if (status === 'published') {
      const existingJob = await Job.findOne({ title: jobApplication.title, company: jobApplication.company });
      if (!existingJob) {
        const newJob = new Job({
          title: jobApplication.title,
          company: jobApplication.company,
          location: jobApplication.location,
          type: jobApplication.type,
          salary: jobApplication.salary,
          description: jobApplication.description,
          requirements: jobApplication.requirements,
          posted: jobApplication.userId,
          tags: jobApplication.tags,
          email: jobApplication.email,
        });

        await newJob.save();
      } else {
        console.log('Job already exists in the Job collection.');
      }
    }

    return NextResponse.json(
      { message: 'Job status updated successfully.', jobApplication },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating job status:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { message: 'Failed to update job status.', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
