// app/applications/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  Briefcase,
  Clock,
  MapPin,
  Trash2,
  ArrowRight, // Ensure ArrowRight is imported
} from "lucide-react";
import Link from "next/link";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AppliedJob {
  _id: string;
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
  userId: string;
  postedAt: string;
  applicationStatus: string;
}

const ITEMS_PER_PAGE = 5;

const ApplicantsPage = () => {
  const { user, isLoaded, isSignedIn } = useUser();

  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      // Check if user data is loaded and user is signed in
      if (isLoaded && isSignedIn && user) {
        try {
          setLoading(true);
          const response = await axios.get<AppliedJob[]>("/api/user-applications");
          setAppliedJobs(response.data);
          setLoading(false);
        } catch (err: unknown) {
          console.error("Error fetching applied jobs:", err);
          if (err instanceof Error) {
            setError(err.message || "Failed to fetch your applied jobs.");
          } else {
            setError("Failed to fetch your applied jobs.");
          }
          setLoading(false);
        }
      }
    };

    fetchAppliedJobs();
  }, [isLoaded, isSignedIn, user]);

  // Function to handle deletion of a job
  const handleDelete = async (jobId: string) => {
    try {
      const response = await axios.delete(`/api/hire-applications/${jobId}`);
      if (response.status === 200) {
        setAppliedJobs((prev) => prev.filter((job) => job._id !== jobId));
        toast.success("Job deleted successfully", {
          description: "The job has been removed from your applied jobs.",
          duration: 3000,
        });
      } else {
        throw new Error(response.data.message || "Failed to delete the job.");
      }
    } catch (err: unknown) {
      console.error("Error deleting job:", err);
      if (axios.isAxiosError(err)) {
        toast.error("Failed to delete the job", {
          description: err.response?.data?.message || "Please try again later.",
          duration: 3000,
        });
      } else if (err instanceof Error) {
        toast.error("Failed to delete the job", {
          description: err.message || "Please try again later.",
          duration: 3000,
        });
      } else {
        toast.error("Failed to delete the job", {
          description: "Please try again later.",
          duration: 3000,
        });
      }
    }
  };

  // Paginate applied jobs
  const paginatedAppliedJobs = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return appliedJobs.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, appliedJobs]);

  // Pagination controls
  const totalPages = Math.ceil(appliedJobs.length / ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="relative min-h-screen bg-background transition-colors duration-300 mt-10">
      {/* Background Gradient Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-pink-500/10 via-transparent to-yellow-500/10 dark:from-pink-500/5 dark:via-transparent dark:to-yellow-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-500/10 via-transparent to-green-500/10 dark:from-blue-500/5 dark:via-transparent dark:to-green-500/5 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      {/* Main Container */}
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground">
            Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-500">
              Applied Jobs
            </span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            View and manage all the jobs you&apos;ve applied for.
          </p>
        </div>

        {/* Applied Jobs Container */}
        <div className="max-w-4xl mx-auto space-y-6">
          {loading ? (
            <div className="text-center text-lg animate-pulse">
              Loading your applied jobs...
            </div>
          ) : error ? (
            <Card className="p-8 text-center backdrop-blur-sm bg-background/80 border-pink-500/20">
              <CardContent>
                <p className="text-muted-foreground text-lg">{error}</p>
              </CardContent>
            </Card>
          ) : appliedJobs.length === 0 ? (
            <Card className="p-8 text-center backdrop-blur-sm bg-background/80 border-pink-500/20">
              <CardContent>
                <p className="text-muted-foreground text-lg">
                  Not yet applied for a job.
                </p>
              </CardContent>
            </Card>
          ) : (
            paginatedAppliedJobs.map((job) => (
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
                    <Badge
                      variant="secondary"
                      className={`
                        ${
                          job.status === "published"
                            ? "bg-green-500/10 text-green-500"
                            : job.status === "review"
                            ? "bg-yellow-500/10 text-yellow-500"
                            : job.status === "ready_to_interview"
                            ? "bg-blue-500/10 text-blue-500"
                            : "bg-red-500/10 text-red-500"
                        }
                      `}
                    >
                      {job.status.replace('_', ' ')}
                    </Badge>
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
                      <Clock className="w-4 h-4 mr-2 text-pink-500" />
                      {job.postedAt
                        ? formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })
                        : "N/A"}
                    </div>
                    <div className="flex items-center">
                      <span className="w-4 h-4 mr-2 inline-block"></span>
                      Application Status: {job.applicationStatus.replace('_', ' ')}
                    </div>
                  </div>

                  <p className="text-muted-foreground line-clamp-3">{job.description}</p>

                  {job.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {job.tags.map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary"
                          className="bg-pink-500/10 text-pink-500"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex justify-between">
                  {/* View Details Button */}
                  <Link href={`/applicants/${job._id}`} passHref legacyBehavior>
                    <Button
                      variant="outline"
                      className="bg-gradient-to-r from-pink-500 to-yellow-500 text-white hover:opacity-90 transition-opacity group"
                    >
                      View Details
                      <span className="ml-2">
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </Button>
                  </Link>

                  {/* Delete Button */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        className={`text-red-500 hover:text-red-700`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to delete this job?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action will permanently remove the job from your applied jobs and delete all related data. This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(job._id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && appliedJobs.length > ITEMS_PER_PAGE && (
          <div className="max-w-4xl mx-auto mt-8 flex justify-center space-x-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {[...Array(totalPages)].map((_, index) => (
              <Button
                key={index}
                variant={currentPage === index + 1 ? "default" : "outline"}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicantsPage;
