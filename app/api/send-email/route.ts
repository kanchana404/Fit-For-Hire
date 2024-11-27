import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// This is the handler for the POST request
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
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
      jobEmail, // The recipient's email address from the job posting
    } = body;

    if (!firstName || !lastName || !email || !phone || !resumeUrl || !jobEmail) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Configure the transporter with environment variables
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.APP_EMAIL, // Email from environment variables
        pass: process.env.APP_PASSWORD, // App password from environment variables
      },
    });

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

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Application sent successfully!' }, { status: 200 });
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { message: 'Failed to send application', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
