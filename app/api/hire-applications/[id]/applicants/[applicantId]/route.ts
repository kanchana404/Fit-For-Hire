// app/api/hire-applications/[id]/applicants/[applicantId]/route.ts

"use server";

import { connectToDatabase } from "@/lib/database";
import { HireApplication } from "@/lib/database/models/HireApplication";
import { Application } from "@/lib/database/models/Application";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; applicantId: string }> }
) {
  try {
    // Await the params object
    const params = await context.params;
    const { id, applicantId } = params;

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

    const hireApplication = await HireApplication.findOne({
      _id: id,
      email: userEmail,
    }).lean();

    if (!hireApplication) {
      return NextResponse.json(
        { message: "Hire application not found or you do not have access." },
        { status: 404 }
      );
    }

    const applicant = await Application.findOne({
      _id: applicantId,
      jobId: hireApplication.jobId,
    });

    if (!applicant) {
      return NextResponse.json(
        {
          message:
            "Applicant not found or does not belong to this hire application.",
        },
        { status: 404 }
      );
    }

    // **Prevent status change if already rejected or ready to interview**
    if (
      applicant.status === "reject" ||
      applicant.status === "ready_to_interview"
    ) {
      return NextResponse.json(
        {
          message:
            "Cannot change status of an applicant who has already been rejected or is ready for an interview.",
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!["reject", "ready_to_interview"].includes(status)) {
      return NextResponse.json({ message: "Invalid status." }, { status: 400 });
    }

    applicant.status = status;
    await applicant.save();

    // Prepare data for the jobstatus API
    const jobStatusData = {
      email: applicant.email, // Applicant's email
      firstName: applicant.firstName,
      lastName: applicant.lastName,
      jobTitle: applicant.jobTitle,
      jobCompany: applicant.jobCompany,
      status,
    };

    // Send email using the jobstatus API
    const emailResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/jobstatus`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobStatusData),
      }
    );

    if (!emailResponse.ok) {
      console.error("Failed to send status update email.");
      return NextResponse.json(
        { message: "Status updated but failed to send email." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: `Applicant status updated to '${status.replace(
          "_",
          " "
        )}' and email sent successfully.`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating applicant status:", error);
    return NextResponse.json(
      { message: "Failed to update applicant status." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string; applicantId: string }> }
) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Await the params object to access its properties
    const params = await context.params;
    const { id, applicantId } = params;

    // Retrieve the current user
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

    // Connect to the database
    await connectToDatabase();

    // Verify that the HireApplication exists and belongs to the user
    const hireApplication = await HireApplication.findOne({
      _id: id,
      email: userEmail,
    }).session(session);

    if (!hireApplication) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "Hire application not found or you do not have access." },
        { status: 404 }
      );
    }

    // Find and delete the specified applicant
    const deletedApplicant = await Application.findOneAndDelete(
      {
        _id: applicantId,
        jobId: hireApplication.jobId,
      },
      { session }
    );

    if (!deletedApplicant) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        {
          message:
            "Applicant not found or does not belong to this hire application.",
        },
        { status: 404 }
      );
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return NextResponse.json(
      { message: "Applicant deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error deleting applicant:", error);
    return NextResponse.json(
      { message: "Failed to delete applicant." },
      { status: 500 }
    );
  }
}
