// app/jobs/page.tsx

"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import JobApplicationPopup from "@/components/JobApplicationPopup";
import { Toaster } from "@/components/ui/sonner";
import axios from "axios";

// Define the Job interface based on your Mongoose schema
interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  posted: string;
  tags: string[];
  email: string;
}

const ITEMS_PER_PAGE = 5;

const JobListings = () => {
  // State variables for search and filter
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [jobType, setJobType] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // State variables for jobs, loading, and error
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch jobs from the API when the component mounts
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await axios.get<Job[]>("/api/jobs");
        setAllJobs(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError("Failed to fetch jobs.");
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Debounce search input to optimize performance
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 300); // Debounce delay of 300ms

    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  // Filter jobs based on search query and job type
  const filteredJobs = useMemo(() => {
    return allJobs.filter((job) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = jobType === "All" || job.type === jobType;

      return matchesSearch && matchesType;
    });
  }, [searchQuery, jobType, allJobs]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, jobType]);

  // Paginate the filtered jobs
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredJobs.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filteredJobs]);

  // Handle "Apply Now" button click
  const handleApplyNow = (job: Job) => {
    setSelectedJob(job);
  };

  // Handle popup close
  const handleClosePopup = () => {
    setSelectedJob(null);
  };

  return (
    <div className="mt-10 relative min-h-screen bg-background transition-colors duration-300">
      {/* Toaster for notifications */}
      <Toaster />

      {/* Main container */}
      <div className="container mx-auto px-4 py-12">
        {/* Search and Filters */}
        <div className="max-w-4xl mx-auto mb-12">
          <h1 className="text-4xl font-bold text-center mb-8">
            Find Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-500">
              Dream Job
            </span>
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-2">
              <Input
                placeholder="Search jobs..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="h-12"
              />
            </div>

            <Select value={jobType} onValueChange={setJobType}>
              <SelectTrigger className="h-12 backdrop-blur-sm bg-background/80">
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                <SelectItem value="Full-time">Full-time</SelectItem>
                <SelectItem value="Part-time">Part-time</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
                <SelectItem value="Remote">Remote</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Job Listings */}
        <div className="max-w-4xl mx-auto space-y-6">
          {loading ? (
            <p className="text-center text-lg">Loading jobs...</p>
          ) : error ? (
            <Card className="p-8 text-center backdrop-blur-sm bg-background/80 border-pink-500/20">
              <CardContent>
                <p className="text-muted-foreground text-lg">{error}</p>
              </CardContent>
            </Card>
          ) : filteredJobs.length === 0 ? (
            <Card className="p-8 text-center backdrop-blur-sm bg-background/80 border-pink-500/20">
              <CardContent>
                <p className="text-muted-foreground text-lg">
                  No jobs found matching your search criteria. Try adjusting your
                  filters.
                </p>
              </CardContent>
            </Card>
          ) : (
            paginatedJobs.map((job) => (
              <Card
                key={job._id}
                className="group hover:shadow-lg transition-all duration-200 backdrop-blur-sm bg-background/80 border-pink-500/20 hover:border-pink-500/40"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-500">
                        {job.title}
                      </CardTitle>
                      <p className="text-lg text-muted-foreground">{job.company}</p>
                    </div>
                    <Button
                      onClick={() => handleApplyNow(job)}
                      className="bg-gradient-to-r from-pink-500 to-yellow-500 text-white hover:opacity-90 transition-opacity group"
                    >
                      Apply Now
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-4 text-muted-foreground">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-pink-500" />
                      {job.location}
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="w-4 h-4 mr-2 text-pink-500" />
                      {job.type}
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-pink-500" />
                      {job.salary}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-pink-500" />
                      {job.posted}
                    </div>
                  </div>

                  <p className="text-muted-foreground">{job.description}</p>

                  <div className="space-y-2">
                    <h4 className="font-medium">Requirements:</h4>
                    <ul className="list-disc pl-5 text-muted-foreground">
                      {job.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>

                <CardFooter>
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-gradient-to-r from-pink-500/10 to-yellow-500/10 text-pink-500 hover:from-pink-500/20 hover:to-yellow-500/20 transition-colors"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardFooter>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && !error && filteredJobs.length > ITEMS_PER_PAGE && (
          <div className="max-w-4xl mx-auto mt-8">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredJobs.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Job Application Popup */}
      {selectedJob && (
        <JobApplicationPopup
          isOpen={!!selectedJob}
          onClose={handleClosePopup}
          jobTitle={selectedJob.title}
          jobCompany={selectedJob.company}
          jobEmail={selectedJob.email}
        />
      )}
    </div>
  );
};

export default JobListings;
