// app/api/hire-applications/[id]/route.ts

import { connectToDatabase } from "@/lib/database";
import { Application } from "@/lib/database/models/Application";
import { HireApplication } from "@/lib/database/models/HireApplication";
import { currentUser } from "@clerk/nextjs/server";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

interface HireApplicationResponse {
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
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized access. Please sign in." },
        { status: 401 }
      );
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      return NextResponse.json(
        { message: "User email not found." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const hireApplication = await HireApplication.findOne({ _id: id, email: userEmail }).lean();

    if (!hireApplication) {
      return NextResponse.json(
        { message: "Hire application not found or you do not have access." },
        { status: 404 }
      );
    }

    const formattedHireApplication: HireApplicationResponse = {
      _id: String(hireApplication._id),
      jobId: hireApplication.jobId,
      title: hireApplication.title,
      company: hireApplication.company,
      location: hireApplication.location,
      type: hireApplication.type,
      salary: hireApplication.salary,
      description: hireApplication.description,
      requirements: hireApplication.requirements,
      email: hireApplication.email,
      tags: hireApplication.tags,
      status: hireApplication.status,
      userId: hireApplication.userId,
      postedAt: hireApplication.postedAt.toISOString(),
    };

    return NextResponse.json(formattedHireApplication);
  } catch (error) {
    console.error("Error fetching hire application:", error);
    return NextResponse.json(
      { message: "Failed to fetch hire application." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Await the params object
    const params = await context.params;
    const { id } = params;

    const user = await currentUser();

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "Unauthorized access. Please sign in." },
        { status: 401 }
      );
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "User email not found." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find and delete the HireApplication within the transaction
    const deletedHireApplication = await HireApplication.findOneAndDelete(
      { _id: id, email: userEmail },
      { session }
    );

    if (!deletedHireApplication) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "Hire application not found or you do not have access." },
        { status: 404 }
      );
    }

    // Delete all Applications associated with the deleted HireApplication's jobId within the transaction
    const deletedApplications = await Application.deleteMany(
      { jobId: deletedHireApplication.jobId },
      { session }
    );

    console.log(`Deleted ${deletedApplications.deletedCount} applicant(s) associated with jobId: ${deletedHireApplication.jobId}`);

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json(
      { message: "Hire application and all associated applicants deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error deleting hire application:", error);
    return NextResponse.json(
      { message: "Failed to delete hire application." },
      { status: 500 }
    );
  }
}