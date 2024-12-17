// app/api/jobstatus/route.ts

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Define the expected request body structure
interface JobStatusEmailRequest {
  email: string;          // Applicant's email
  firstName: string;
  lastName: string;
  jobTitle: string;
  jobCompany: string;
  status: "reject" | "ready_to_interview";
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body: JobStatusEmailRequest = await request.json();
    console.log("Received job status update:", body);

    const { email, firstName, lastName, jobTitle, jobCompany, status } = body;

    // Validate required fields
    if (!email || !firstName || !lastName || !jobTitle || !jobCompany || !status) {
      console.warn("Missing required fields in job status update.");
      return NextResponse.json(
        { message: "Missing required fields." },
        { status: 400 }
      );
    }

    // Configure the transporter using environment variables
    const transporter = nodemailer.createTransport({
      service: "Gmail", // You can use other services like Outlook, etc.
      auth: {
        user: process.env.APP_EMAIL,       // Your email address
        pass: process.env.APP_PASSWORD,    // Your email password or app-specific password
      },
    });

    // Prepare email content based on status
    let subject = "";
    let text = "";
    let html = "";

    if (status === "reject") {
      subject = `Application Status: Rejected for ${jobTitle}`;
      text = `Dear ${firstName},\n\nWe regret to inform you that your application for ${jobTitle} at ${jobCompany} has been rejected.\n\nBest regards,\n${jobCompany}`;
      html = `
        <p>Dear ${firstName},</p>
        <p>We regret to inform you that your application for <strong>${jobTitle}</strong> at <strong>${jobCompany}</strong> has been rejected.</p>
        <p>Best regards,<br/>${jobCompany}</p>
      `;
    } else if (status === "ready_to_interview") {
      subject = `Application Status: Ready for Interview for ${jobTitle}`;
      text = `Dear ${firstName},\n\nCongratulations! Your application for ${jobTitle} at ${jobCompany} is ready for an interview.\n\nBest regards,\n${jobCompany}`;
      html = `
        <p>Dear ${firstName},</p>
        <p>Congratulations! Your application for <strong>${jobTitle}</strong> at <strong>${jobCompany}</strong> is ready for an interview.</p>
        <p>Best regards,<br/>${jobCompany}</p>
      `;
    } else {
      console.warn("Invalid status provided.");
      return NextResponse.json(
        { message: "Invalid status provided." },
        { status: 400 }
      );
    }

    // Define the email options
    const mailOptions = {
      from: `"${jobCompany} HR" <${process.env.APP_EMAIL}>`, // Sender address
      to: email,                                           // Applicant's email
      subject,
      text,
      html,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log(`Status update email sent to ${email} successfully.`);

    // Respond with success
    return NextResponse.json(
      { message: "Status update email sent successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Error sending job status update email:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      {
        message: "Failed to send job status update email.",
        error: error instanceof Error ? error.message : "Unknown error.",
      },
      { status: 500 }
    );
  }
}
