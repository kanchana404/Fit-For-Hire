// app/api/hire-applications/[id]/route.ts

import { connectToDatabase } from "@/lib/database";
import { HireApplication } from "@/lib/database/models/HireApplication";
import { Job } from "@/lib/database/models/Job";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized access. Please sign in." },
        { status: 401 }
      );
    }

    const applicationId = params.id;

    // Connect to the database
    await connectToDatabase();

    // Find the HireApplication by _id
    const application = await HireApplication.findById(applicationId).lean();

    if (!application) {
      return NextResponse.json(
        { message: "Hire application not found." },
        { status: 404 }
      );
    }

    // Delete the HireApplication
    await HireApplication.findByIdAndDelete(applicationId);

    // Delete the Job with the same jobId
    await Job.findOneAndDelete({ jobId: application.jobId });

    return NextResponse.json(
      { message: "Hire application and associated job deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting hire application:", error);
    return NextResponse.json(
      { message: "Failed to delete hire application." },
      { status: 500 }
    );
  }
}
