// app/api/hire-applications/[id]/applicants/route.ts

import { connectToDatabase } from "@/lib/database";
import { HireApplication } from "@/lib/database/models/HireApplication";
import { Application } from "@/lib/database/models/Application";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

interface Applicant {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  resumeUrl: string;
  jobTitle: string;
  jobCompany: string;
  jobEmail: string;
  status: string;
  postedAt: string;
}

export async function GET(request: Request, context: { params: { id: string } }) {
  try {
    const { id } = await context.params;

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

    const applicants = await Application.find({ jobId: hireApplication.jobId }).lean();

    const formattedApplicants: Applicant[] = applicants.map((applicant) => ({
      _id: String(applicant._id),
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
      status: applicant.status,
      postedAt: applicant.postedAt.toISOString(),
    }));

    return NextResponse.json(formattedApplicants);
  } catch (error) {
    console.error("Error fetching applicants:", error);
    return NextResponse.json(
      { message: "Failed to fetch applicants." },
      { status: 500 }
    );
  }
}
