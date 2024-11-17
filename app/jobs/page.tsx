"use client"
import React, { useState, useMemo, useEffect } from "react";
import { Command, CommandInput } from "@/components/ui/command";
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
import { jobs as allJobs } from "@/constants";
import { Pagination } from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 5;

const JobListings = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [jobType, setJobType] = useState("All");
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setMounted(true);
  }, []);

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
  }, [searchQuery, jobType]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, jobType]);

  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredJobs.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filteredJobs]);

  if (!mounted) return null;

  return (
    <div className="mt-10 relative min-h-screen bg-background transition-colors duration-300">
      {/* Matching gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-transparent to-yellow-500/10 dark:from-pink-500/5 dark:via-transparent dark:to-yellow-500/5 -z-10" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-700" />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto mb-12">
          <h1 className="text-4xl font-bold text-center mb-8">
            Find Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-500">
              Dream Job
            </span>
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-2">
              <Command className="rounded-lg border shadow-md backdrop-blur-sm bg-background/80">
                <CommandInput
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  className="h-12"
                />
              </Command>
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

        <div className="max-w-4xl mx-auto space-y-6">
          {paginatedJobs.length === 0 ? (
            <Card className="p-8 text-center backdrop-blur-sm bg-background/80 border-pink-500/20">
              <CardContent>
                <p className="text-muted-foreground text-lg">
                  No jobs found matching your search criteria. Try adjusting your filters.
                </p>
              </CardContent>
            </Card>
          ) : (
            paginatedJobs.map((job) => (
              <Card
                key={job.id}
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
                    <Button className="bg-gradient-to-r from-pink-500 to-yellow-500 text-white hover:opacity-90 transition-opacity group">
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
                      {(job.requirements || []).map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>

                <CardFooter>
                  <div className="flex flex-wrap gap-2">
                    {(job.tags || []).map((tag, index) => (
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

        <div className="max-w-4xl mx-auto mt-8">
          <Pagination
            currentPage={currentPage}
            totalItems={filteredJobs.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};

export default JobListings;