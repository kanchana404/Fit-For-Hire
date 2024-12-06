"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { JobData } from '@/types/JobData';
import { MapPin, BriefcaseBusiness, Tag, DollarSign, UserCheck } from 'lucide-react';

const JobPostingPage = () => {
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
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-transparent to-yellow-500/10 dark:from-pink-500/5 dark:via-transparent dark:to-yellow-500/5 -z-10" />
        <div className="absolute top-20 right-20 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-700" />
        
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto bg-white/85 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/10">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">No Job ID Provided</h1>
            <p className="mt-2 text-gray-600">Please use the link provided in the email to access the job details.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!jobData) {
    return (
      <div className="relative min-h-screen flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-transparent to-yellow-500/10 dark:from-pink-500/5 dark:via-transparent dark:to-yellow-500/5 -z-10" />
        <div className="absolute top-20 right-20 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-700" />
        
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto bg-white/85 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/10">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Job Not Found</h1>
            <p className="mt-2 text-gray-600">The job you are looking for does not exist or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-transparent to-yellow-500/10 dark:from-pink-500/5 dark:via-transparent dark:to-yellow-500/5 -z-10" />
      <div className="absolute top-20 right-20 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-700" />

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white/85 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/10">
          {/* Job Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              {jobData.title}
            </h1>
            <div className="flex justify-center items-center space-x-4 text-gray-600">
              <div className="flex items-center space-x-2">
                <BriefcaseBusiness className="w-5 h-5" />
                <span>{jobData.company}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>{jobData.location}</span>
              </div>
            </div>
          </div>

          {/* Job Details Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-center space-x-4">
              <BriefcaseBusiness className="w-6 h-6 text-pink-500" />
              <div>
                <h3 className="font-semibold text-gray-700">Job Type</h3>
                <p className="text-gray-600">{jobData.type}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-center space-x-4">
              <DollarSign className="w-6 h-6 text-yellow-500" />
              <div>
                <h3 className="font-semibold text-gray-700">Salary</h3>
                <p className="text-gray-600">{jobData.salary}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Job Description</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {jobData.description}
            </p>
          </div>

          {/* Requirements */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Requirements</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              {jobData.requirements.map((req, i) => (
                <li key={i} className="pl-2">{req}</li>
              ))}
            </ul>
          </div>

          {/* Tags */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <Tag className="w-6 h-6 mr-2 text-green-500" />
              Job Tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {jobData.tags.map((tag, i) => (
                <span 
                  key={i} 
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Apply Button */}
          <div className="text-center">
            <button 
              className="bg-gradient-to-r from-pink-500 to-yellow-500 text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center mx-auto space-x-2"
            >
              <UserCheck className="w-5 h-5" />
              <span>Apply Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobPostingPage;