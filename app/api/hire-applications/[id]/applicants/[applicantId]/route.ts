// app/api/hire-applications/[id]/applicants/[applicantId]/route.ts

import { connectToDatabase } from "@/lib/database";
import { HireApplication } from "@/lib/database/models/HireApplication";
import { Application } from "@/lib/database/models/Application";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  context: { params: { id: string; applicantId: string } }
) {
  try {
    const { id, applicantId } = await context.params;

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

    const deletedApplicant = await Application.findOneAndDelete({
      _id: applicantId,
      jobId: hireApplication.jobId,
    });

    if (!deletedApplicant) {
      return NextResponse.json(
        {
          message:
            "Applicant not found or does not belong to this hire application.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Applicant deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting applicant:", error);
    return NextResponse.json(
      { message: "Failed to delete applicant." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: { id: string; applicantId: string } }
) {
  try {
    const { id, applicantId } = await context.params;

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

    const body = await request.json();
    const { status } = body;

    if (!["reject", "ready_to_interview"].includes(status)) {
      return NextResponse.json(
        { message: "Invalid status." },
        { status: 400 }
      );
    }

    applicant.status = status;
    await applicant.save();

    // Prepare email content based on status
    let subject = "";
    let text = "";
    let html = "";

    if (status === "reject") {
      subject = `Application Status: Rejected for ${applicant.jobTitle}`;
      text = `Dear ${applicant.firstName},\n\nWe regret to inform you that your application for ${applicant.jobTitle} at ${applicant.jobCompany} has been rejected.\n\nBest regards,\n${applicant.jobCompany}`;
      html = `
        <p>Dear ${applicant.firstName},</p>
        <p>We regret to inform you that your application for <strong>${applicant.jobTitle}</strong> at <strong>${applicant.jobCompany}</strong> has been rejected.</p>
        <p>Best regards,<br/>${applicant.jobCompany}</p>
      `;
    } else if (status === "ready_to_interview") {
      subject = `Application Status: Ready for Interview for ${applicant.jobTitle}`;
      text = `Dear ${applicant.firstName},\n\nCongratulations! Your application for ${applicant.jobTitle} at ${applicant.jobCompany} is ready for an interview.\n\nBest regards,\n${applicant.jobCompany}`;
      html = `
        <p>Dear ${applicant.firstName},</p>
        <p>Congratulations! Your application for <strong>${applicant.jobTitle}</strong> at <strong>${applicant.jobCompany}</strong> is ready for an interview.</p>
        <p>Best regards,<br/>${applicant.jobCompany}</p>
      `;
    }

    // Send email using the send-email API
    const emailResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/send-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: applicant.jobId,
          firstName: applicant.firstName,
          lastName: applicant.lastName,
          email: applicant.email,
          phone: applicant.phone,
          address: applicant.address,
          city: applicant.city,
          state: applicant.state,
          zipCode: applicant.zipCode,
          resumeUrl: applicant.resumeUrl,
          jobTitle: applicant.jobTitle,
          jobCompany: applicant.jobCompany,
          jobEmail: applicant.jobEmail,
          subject,
          text,
          html,
        }),
      }
    );

    if (!emailResponse.ok) {
      console.error("Failed to send email.");
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
