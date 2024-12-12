// app/api/update-job-status/route.ts

import { connectToDatabase } from '@/lib/database';
import { ApplicationStatus, HireApplication } from '@/lib/database/models/HireApplication';
import { Job } from '@/lib/database/models/Job';
import { User } from '@/lib/database/models/User'; // Import User model
import { currentUser } from '@clerk/nextjs/server';
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
      console.warn(`Unauthorized access attempt by user ID: ${user?.id}`);
      return NextResponse.json(
        { message: 'Unauthorized access.' },
        { status: 403 }
      );
    }

    // Ensure the request is in JSON format
    const payload: UpdateStatusPayload = await request.json();

    const { jobId, status } = payload;

    if (!jobId || !status) {
      console.warn(`Invalid payload: ${JSON.stringify(payload)}`);
      return NextResponse.json(
        { message: 'Job ID and status are required.' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses: ApplicationStatus[] = ['published', 'review', 'reject'];
    if (!validStatuses.includes(status)) {
      console.warn(`Invalid status value: ${status}`);
      return NextResponse.json(
        { message: 'Invalid status value.' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    console.log(`Connected to the database for updating job status.`);

    // Find the job application
    const jobApplication = await HireApplication.findOne({ jobId });

    if (!jobApplication) {
      console.warn(`Job application not found for jobId: ${jobId}`);
      return NextResponse.json(
        { message: 'Job application not found.' },
        { status: 404 }
      );
    }

    // Update the status
    jobApplication.status = status;
    await jobApplication.save();
    console.log(`Updated job status to ${status} for jobId: ${jobId}`);

    // If status is 'published', insert into Job collection
    if (status === 'published') {
      // Find the User based on jobApplication.email
      const userRecord = await User.findOne({ email: jobApplication.email });

      if (!userRecord) {
        console.error(`User with email ${jobApplication.email} not found.`);
        return NextResponse.json(
          { message: 'User associated with this application not found.' },
          { status: 404 }
        );
      }

      console.log(`Found user with email ${jobApplication.email}: ${userRecord.clerkId}`);

      // Check if Job already exists
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
          posted: userRecord.clerkId, // Set to User's clerkId
          tags: jobApplication.tags,
          email: jobApplication.email,
        });

        try {
          await newJob.save();
          console.log(`New job created in Job collection with jobId: ${jobId}`);
        } catch (saveError) {
          console.error(`Failed to save new job: ${saveError instanceof Error ? saveError.message : saveError}`);
          return NextResponse.json(
            { message: 'Failed to create job in Job collection.', error: saveError instanceof Error ? saveError.message : 'Unknown error' },
            { status: 500 }
          );
        }
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
