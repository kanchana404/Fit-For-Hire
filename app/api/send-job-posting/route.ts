// app/api/send-job-posting/route.ts

import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { storeJobData } from '@/app/api/job-data/route';

// Define the expected structure of the job data
type JobData = {
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  email: string;
  tags: string[];
};

export async function POST(request: Request) {
  try {
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

    // Basic validation
    if (!title || !company || !email) {
      return NextResponse.json(
        { message: 'Missing required fields: title, company, or email.' },
        { status: 400 }
      );
    }

    // Generate a unique jobId
    const jobId = crypto.randomUUID();

    // Store the job data in our in-memory store
    storeJobData(jobId, jobData);

    // Configure the transporter with environment variables
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.APP_EMAIL, // Your Gmail address
        pass: process.env.APP_PASSWORD, // Your Gmail App Password
      },
    });

    // Construct the admin link
    const adminLink = `https://fitforhire.kanchanadev.org/admin?jobId=${jobId}`;

    // Construct the email content
    const mailOptions = {
      from: `"Job Posting Form" <${process.env.APP_EMAIL}>`,
      to: 'kanchanakavitha6@gmail.com', // Recipient email
      subject: `New Job Posting: ${title} at ${company}`,
      text: `
Job Posting Details:

Title: ${title}
Company: ${company}
Location: ${location}
Type: ${type}
Salary: ${salary}

Description:
${description}

Requirements:
${requirements.map((req, idx) => `${idx + 1}. ${req}`).join('\n')}

Tags: ${tags.join(', ')}

Posted By: ${email}

View and manage this job posting:
${adminLink}
`,
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
          ${requirements.map((req) => `<li>${req}</li>`).join('')}
        </ul>
        <p><strong>Tags:</strong> ${tags.join(', ')}</p>
        <p><strong>Posted By:</strong> ${email}</p>
        <p><a href="${adminLink}" target="_blank">View in Admin</a></p>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Job posting sent successfully!' }, { status: 200 });
  } catch (error) {
    console.error('Error sending job posting email:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { message: 'Failed to send job posting.', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
