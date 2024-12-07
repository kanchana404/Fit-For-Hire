// app/api/send-job-posting/route.ts

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { JobData } from "@/types/JobData";

import crypto from "crypto";
import { connectToDatabase } from "@/lib/database";
import { HireApplication } from "@/lib/database/models/HireApplication";
// Removed import for storeJobData as it's undefined

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    // Assuming you have some form of user authentication, which is currently not implemented
    // If you do, handle user authentication here

    const jobData: JobData = await request.json();

    const {
      title,
      company,
      location,
      type,
      salary,
      description,
      requirements,
      email,
      tags,
    } = jobData;

    if (!title || !company || !email) {
      return NextResponse.json(
        { message: "Missing required fields: title, company, or email." },
        { status: 400 }
      );
    }

    const jobId = crypto.randomUUID();

    // Create a new HireApplication document
    const hireApplication = new HireApplication({
      jobId,
      title,
      company,
      location,
      type,
      salary,
      description,
      requirements,
      email,
      tags,
      userId: "unknown", // Since authentication is removed, set a default or handle accordingly
    });

    await hireApplication.save();

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.APP_EMAIL,
        pass: process.env.APP_PASSWORD,
      },
    });

    const adminLink = `http://localhost:3000/admin?jobId=${jobId}`;

    const mailOptions = {
      from: `"Job Posting Form" <${process.env.APP_EMAIL}>`,
      to: "kanchanakavitha6@gmail.com",
      subject: `New Job Posting: ${title} at ${company}`,
      html: `
        <h2>New Job Posting Submitted</h2>
        <p><strong>Title:</strong> ${title}</p>
        <p><strong>Company:</strong> ${company}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Type:</strong> ${type}</p>
        <p><strong>Salary:</strong> ${salary}</p>
        <h3>Description:</h3>
        <p>${description}</p>
        <h3>Requirements:</h3>
        <ul>
          ${requirements.map((req) => `<li>${req}</li>`).join("")}
        </ul>
        <p><strong>Tags:</strong> ${tags.join(", ")}</p>
        <p><strong>Posted By:</strong> ${email}</p>
        <p><a href="${adminLink}" target="_blank">View in Admin</a></p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: "Job posting submitted and email sent successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Error submitting job posting:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      {
        message: "Failed to submit job posting.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
