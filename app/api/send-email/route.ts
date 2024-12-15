// app/api/send-email/route.ts

import { connectToDatabase } from "@/lib/database";
import { Job } from "@/lib/database/models/Job";
import { Application } from "@/lib/database/models/Application";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    // Connect to the database
    await connectToDatabase();
    console.log("Database connected successfully.");

    // Parse the request body
    const body = await request.json();
    console.log("Received request body:", body);

    const {
      jobId,
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      resumeUrl,
      jobTitle,
      jobCompany,
      jobEmail,
    } = body;

    // Validate required fields
    if (
      !jobId ||
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !resumeUrl ||
      !jobTitle ||
      !jobCompany ||
      !jobEmail
    ) {
      console.warn("Missing required fields.");
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify that the jobId exists in the database
    const job = await Job.findOne({ jobId });
    if (!job) {
      console.warn(`Invalid jobId: ${jobId}`);
      return NextResponse.json({ message: "Invalid jobId" }, { status: 400 });
    }
    console.log(`Found job: ${job.title} at ${job.company}`);

    // Save the application to the Application collection
    const application = new Application({
      jobId,
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      resumeUrl,
      jobTitle,
      jobCompany,
      jobEmail,
      status: 'review',
    });

    await application.save();
    console.log("Job application saved to the database.");

    // Configure the transporter with environment variables
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.APP_EMAIL, // Email from environment variables
        pass: process.env.APP_PASSWORD, // App password from environment variables
      },
    });

    // Define the email options
    const mailOptions = {
      from: `"${firstName} ${lastName}" <${email}>`,
      to: jobEmail, // Send to the job's email address
      subject: `Job Application for ${jobTitle} at ${jobCompany}`,
      text: `
Applicant Details:
Name: ${firstName} ${lastName}
Email: ${email}
Phone: ${phone}
Address: ${address}, ${city}, ${state}, ${zipCode}

Resume: ${resumeUrl}
      `,
      html: `
        <h3>Applicant Details:</h3>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Address:</strong> ${address}, ${city}, ${state}, ${zipCode}</p>
        <p><strong>Resume:</strong> <a href="${resumeUrl}">Download Resume</a></p>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log("Application email sent successfully.");

    // Respond with success
    return NextResponse.json({ message: "Application sent!" }, { status: 200 });
  } catch (error) {
    console.error(
      "Error:",
      error instanceof Error ? error.message : String(error)
    );
    return NextResponse.json(
      {
        message: "Failed to send application",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
