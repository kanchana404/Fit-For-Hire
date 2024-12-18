// app/api/scan-api/route.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
export const maxDuration = 55;
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { message: "URL is required." },
        { status: 400 }
      );
    }

    // Forward the request to the external scanning service
    const externalResponse = await fetch("http://82.180.162.124:8000/check-ats-friendly", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add any necessary headers here (e.g., authentication)
      },
      body: JSON.stringify({ url }),
    });

    const data = await externalResponse.json();

    if (!externalResponse.ok) {
      return NextResponse.json(
        { message: data.detail || "An error occurred during analysis." },
        { status: externalResponse.status }
      );
    }

    // Optionally, you can process or sanitize the data here before sending it to the frontend

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error in scan-api:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
