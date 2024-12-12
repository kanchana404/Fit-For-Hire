// app/api/jobs/route.ts

import { connectToDatabase } from '@/lib/database';
import { Job } from '@/lib/database/models/Job';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectToDatabase();
    const jobs = await Job.find().lean(); // Use .lean() for plain JavaScript objects

    // Convert _id and postedAt to strings
    const formattedJobs = jobs.map((job) => ({
      _id: job._id.toString(),
      jobId: job.jobId,
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      salary: job.salary,
      description: job.description,
      requirements: job.requirements,
      posted: job.posted,
      tags: job.tags,
      email: job.email,
      postedAt: job.postedAt.toISOString(), // Ensure postedAt is a string
    }));

    return NextResponse.json(formattedJobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { message: 'Failed to fetch jobs.' },
      { status: 500 }
    );
  }
}
