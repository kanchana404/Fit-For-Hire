// app/hire/page.tsx

import React from "react";
import { currentUser } from "@clerk/nextjs/server"; // Clerk server functions
import JobPostingForm from "@/components/JobPostingForm";
import Link from "next/link";

const JobPostingPage = async () => {
  // Fetch the current authenticated user
  const user = await currentUser();

  if (!user) {
    // If user data couldn't be fetched, show an error message with a link to sign in
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <p className="text-red-500 mb-4">
            Unable to retrieve user information. Please try again later.
          </p>
          <Link href="/sign-in" className="text-blue-500 underline">
            Return to Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Extract the user's email address (default to the first email if no primary email is defined)
  const userEmail = user.emailAddresses?.[0]?.emailAddress || "";

  if (!userEmail) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <p className="text-red-500 mb-4">
            No email address found for this user. Please contact support.
          </p>
          <Link href="/sign-in" className="text-blue-500 underline">
            Return to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return <JobPostingForm userEmail={userEmail} />;
};

export default JobPostingPage;
