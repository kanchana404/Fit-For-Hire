// app/api/user-applications/route.ts

"use server";

import { connectToDatabase } from "@/lib/database";
import { Application } from "@/lib/database/models/Application";
import { HireApplication } from "@/lib/database/models/HireApplication";
import { User } from "@/lib/database/models/User";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Interface representing the structure of each applied job returned by the API.
 */
interface AppliedJob {
  _id: string;
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
  status: string;
  userId: string;
  postedAt: string;
  applicationStatus: string;
}

export async function GET() { // Prefixed with _ to fix ESLint
  try {
    // **1. Authenticate the User**
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized access. Please sign in." },
        { status: 401 }
      );
    }

    const clerkId = user.id; // Clerk's user ID

    // **2. Connect to the Database**
    await connectToDatabase();

    // **3. Retrieve User Email from the User Model**
    const dbUser = await User.findOne({ clerkId }).lean();

    if (!dbUser) {
      return NextResponse.json(
        { message: "User not found in the database." },
        { status: 404 }
      );
    }

    const userEmail = dbUser.email;

    if (!userEmail) {
      return NextResponse.json(
        { message: "User email not found." },
        { status: 400 }
      );
    }

    // **4. Fetch All Applications by the User**
    const userApplications = await Application.find({ email: userEmail }).lean();

    // **5. Handle No Applications Found**
    if (!userApplications || userApplications.length === 0) {
      // Return an empty array instead of an object
      return NextResponse.json([], { status: 200 });
    }

    // **6. Extract Unique Job IDs from Applications**
    const jobIds = [...new Set(userApplications.map(app => app.jobId))];

    // **7. Fetch Corresponding HireApplications**
    const hireApplications = await HireApplication.find(
      { jobId: { $in: jobIds }, isDeleted: { $ne: true } }, // Exclude soft-deleted jobs if applicable
      'jobId title company location type salary description requirements email tags status userId postedAt' // Select only necessary fields
    ).lean();

    // **8. Map Job IDs to Application Statuses**
    const applicationStatusMap: Record<string, string> = {};
    userApplications.forEach(app => {
      applicationStatusMap[app.jobId] = app.status;
    });

    // **9. Combine HireApplication Data with Application Status**
    const userAppliedJobs: AppliedJob[] = hireApplications.map(hireApp => ({
      _id: hireApp._id.toString(), // Convert ObjectId to string
      jobId: hireApp.jobId,
      title: hireApp.title,
      company: hireApp.company,
      location: hireApp.location,
      type: hireApp.type,
      salary: hireApp.salary,
      description: hireApp.description,
      requirements: hireApp.requirements,
      email: hireApp.email,
      tags: hireApp.tags,
      status: hireApp.status,
      userId: hireApp.userId,
      postedAt: hireApp.postedAt.toISOString(), // Convert Date to string
      applicationStatus: applicationStatusMap[hireApp.jobId] || "unknown",
    }));

    // **10. Return the Response**
    return NextResponse.json(userAppliedJobs, { status: 200 });
  } catch (error) {
    console.error("Error fetching user applications:", error);
    return NextResponse.json(
      { message: "Failed to fetch user applications." },
      { status: 500 }
    );
  }
}
