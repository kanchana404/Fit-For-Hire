// app/admin/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { JobData } from '@/types/JobData'; // Ensure the path is correct

export const dynamic = 'force-dynamic'; // Prevents prerendering

const AdminPage = () => {
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");

  useEffect(() => {
    const fetchData = async () => {
      if (!jobId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/job-data?jobId=${jobId}`);
        if (!response.ok) {
          setJobData(null);
        } else {
          const data = await response.json();
          setJobData(data.jobData);
        }
      } catch (error) {
        console.error("Error fetching job data:", error);
        setJobData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId]);

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!jobId) {
    return (
      <div className="relative min-h-screen flex items-center">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold">No Job ID Provided</h1>
          <p className="mt-2">Please use the link provided in the email to access the job details.</p>
        </div>
      </div>
    );
  }

  if (!jobData) {
    return (
      <div className="relative min-h-screen flex items-center">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold">Job Not Found</h1>
          <p className="mt-2">The job you are looking for does not exist or has been removed.</p>
        </div>
      </div>
    );
  }

  // Display the job data in read-only format
  return (
    <div className="relative min-h-screen flex items-center">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-transparent to-yellow-500/10 dark:from-pink-500/5 dark:via-transparent dark:to-yellow-500/5 -z-10" />
      <div className="absolute top-20 right-20 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-700" />

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-white/10">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
            Admin Job View
          </h1>
          <div className="overflow-x-auto">
            <table className="table-auto w-full text-left mb-4">
              <tbody>
                <tr>
                  <th className="px-4 py-2">Title</th>
                  <td className="px-4 py-2">{jobData.title}</td>
                </tr>
                <tr>
                  <th className="px-4 py-2">Company</th>
                  <td className="px-4 py-2">{jobData.company}</td>
                </tr>
                <tr>
                  <th className="px-4 py-2">Location</th>
                  <td className="px-4 py-2">{jobData.location}</td>
                </tr>
                <tr>
                  <th className="px-4 py-2">Type</th>
                  <td className="px-4 py-2">{jobData.type}</td>
                </tr>
                <tr>
                  <th className="px-4 py-2">Salary</th>
                  <td className="px-4 py-2">{jobData.salary}</td>
                </tr>
                <tr>
                  <th className="px-4 py-2 align-top">Description</th>
                  <td className="px-4 py-2 whitespace-pre-wrap">{jobData.description}</td>
                </tr>
                <tr>
                  <th className="px-4 py-2 align-top">Requirements</th>
                  <td className="px-4 py-2">
                    <ul className="list-disc ml-4">
                      {jobData.requirements.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
                <tr>
                  <th className="px-4 py-2 align-top">Tags</th>
                  <td className="px-4 py-2">{jobData.tags.join(", ")}</td>
                </tr>
                <tr>
                  <th className="px-4 py-2">Posted By</th>
                  <td className="px-4 py-2">{jobData.email}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Since this is a read-only admin page, we do not render editable inputs */}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
