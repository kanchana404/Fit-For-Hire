"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Tag,
  Plus,
} from "lucide-react";
import { JobData } from '@/types/JobData';

// You can keep the existing constants if needed
const JOB_TYPES = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "remote", label: "Remote" },
];

const JobPostingDetailsPage: React.FC = () => {
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");

  useEffect(() => {
    const fetchData = async () => {
      // Check if jobId is not provided
      if (!jobId) {
        setError("No Job ID Provided. Please use the correct link.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/job-data?jobId=${jobId}`);
        
        if (!response.ok) {
          // Handle API errors
          if (response.status === 404) {
            setError("Job not found. The job may have been removed or does not exist.");
          } else {
            setError("An error occurred while fetching job details.");
          }
          setJobData(null);
        } else {
          const data = await response.json();
          setJobData(data.jobData);
          setError(null);
        }
      } catch (error) {
        console.error("Error fetching job data:", error);
        setError("Network error. Please check your connection and try again.");
        setJobData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId]);

  // Loading state
  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading job details...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="relative min-h-screen flex items-center">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-transparent to-yellow-500/10 dark:from-pink-500/5 dark:via-transparent dark:to-yellow-500/5 -z-10" />
        <div className="absolute top-20 right-20 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-700" />
        
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto bg-white/85 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/10">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Error</h1>
            <p className="mt-2 text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // If no job data is available after error checking
  if (!jobData) {
    return (
      <div className="relative min-h-screen flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-transparent to-yellow-500/10 dark:from-pink-500/5 dark:via-transparent dark:to-yellow-500/5 -z-10" />
        <div className="absolute top-20 right-20 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-700" />
        
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto bg-white/85 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/10">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Job Not Found</h1>
            <p className="mt-2 text-gray-600">Unable to retrieve job details. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  // Render job details (same as previous implementation)
  return (
    <div className="relative min-h-screen flex items-center bg-background mt-9">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-transparent to-yellow-500/10 -z-10" />

      {/* Animated Blur Circles */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-700" />

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-card/80 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-white/10">
          <div className="text-center mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Job Posting
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-500 ml-2">
                Details
              </span>
            </h1>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <Label className="flex items-center">
                  <Briefcase className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  Job Title
                </Label>
                <Input
                  value={jobData.title}
                  readOnly
                  className="mt-2 bg-gray-100 cursor-default"
                />
              </div>

              <div>
                <Label className="flex items-center">
                  <Briefcase className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  Company
                </Label>
                <Input
                  value={jobData.company}
                  readOnly
                  className="mt-2 bg-gray-100 cursor-default"
                />
              </div>

              <div>
                <Label className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  Location
                </Label>
                <Input
                  value={jobData.location}
                  readOnly
                  className="mt-2 bg-gray-100 cursor-default"
                />
              </div>

              <div>
                <Label className="flex items-center">
                  <DollarSign className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  Salary Range
                </Label>
                <Input
                  value={jobData.salary}
                  readOnly
                  className="mt-2 bg-gray-100 cursor-default"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <Label className="flex items-center">
                  <Briefcase className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  Job Type
                </Label>
                <Select value={jobData.type} disabled>
                  <SelectTrigger className="mt-2 bg-gray-100 cursor-default">
                    <SelectValue placeholder={jobData.type} />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Job Description</Label>
                <Textarea
                  value={jobData.description}
                  readOnly
                  className="mt-2 min-h-[150px] bg-gray-100 cursor-default"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Requirements Section */}
            <div className="mt-2">
              <Label className="flex items-center mb-2">
                <Plus className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400 " />
                Requirements
              </Label>

              {jobData.requirements.length > 0 && (
                <ul className="list-none mt-2 space-y-1 text-sm">
                  {jobData.requirements.map((req) => (
                    <li
                      key={req}
                      className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded"
                    >
                      <span>* {req}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Tags Section */}
            <div>
              <Label className="flex items-center mt-2">
                <Tag className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                Job Tags
              </Label>

              {jobData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {jobData.tags.map((tag) => (
                    <div
                      key={tag}
                      className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Email Input */}
          <div className="mt-4">
            <Label>Contact Email</Label>
            <Input
              value={jobData.email}
              readOnly
              className="mt-2 bg-gray-100 cursor-default"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobPostingDetailsPage;