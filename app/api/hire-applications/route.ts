// app/api/hire-applications/route.ts

import { connectToDatabase } from "@/lib/database";
import { HireApplication, IHireApplication } from "@/lib/database/models/HireApplication";
import { Application } from "@/lib/database/models/Application";
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
  applicantCount: number;
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

    const applications = await HireApplication.find({ email: userEmail }).lean<IHireApplication[]>();

    const jobIds = applications.map(app => app.jobId);

    const applicantCounts = await Application.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: "$jobId", count: { $sum: 1 } } },
    ]);

    const countMap: { [key: string]: number } = {};
    applicantCounts.forEach(item => {
      countMap[item._id] = item.count;
    });

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
        applicantCount: countMap[app.jobId] || 0,
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
