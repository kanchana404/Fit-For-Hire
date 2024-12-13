// app/api/hire-applications/route.ts

import { connectToDatabase } from "@/lib/database";
import {
  HireApplication,
  IHireApplication,
} from "@/lib/database/models/HireApplication";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

interface IFormattedHireApplication {
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
  _id: string;
}

export async function GET() {
  try {
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

    const applications = await HireApplication.find({ email: userEmail }).lean<
      IHireApplication[]
    >();

    const formattedApplications: IFormattedHireApplication[] = applications.map(
      (app) => ({
        jobId: app.jobId,
        title: app.title,
        company: app.company,
        location: app.location,
        type: app.type,
        salary: app.salary,
        description: app.description,
        requirements: app.requirements,
        email: app.email,
        tags: app.tags,
        status: app.status,
        _id: String(app._id),
      })
    );

    return NextResponse.json(formattedApplications);
  } catch (error) {
    console.error("Error fetching hire applications:", error);
    return NextResponse.json(
      { message: "Failed to fetch hire applications." },
      { status: 500 }
    );
  }
}
