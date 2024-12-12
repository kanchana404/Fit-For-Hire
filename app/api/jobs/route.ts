// app/api/jobs/route.ts

import { connectToDatabase } from "@/lib/database";
import { Job } from "@/lib/database/models/Job";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Connect to the database
    await connectToDatabase();

    // Fetch all jobs from the collection
    const jobs = await Job.find({}).lean();

    // Return the jobs as JSON
    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
