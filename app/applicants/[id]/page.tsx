// app/applicants/[id]/page.tsx

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
  Download,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useParams } from "next/navigation";
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

interface Applicant {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  resumeUrl: string;
  jobTitle: string;
  jobCompany: string;
  jobEmail: string;
  status: string;
  postedAt: string;
}

const ITEMS_PER_PAGE = 5;

const ApplicantsPage = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const params = useParams();
  const id = params.id as string;

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchApplicants = async () => {
      if (isLoaded && isSignedIn && user && id) {
        try {
          setLoading(true);
          const response = await axios.get<Applicant[]>(
            `/api/hire-applications/${id}/applicants`
          );
          setApplicants(response.data);
          setLoading(false);
        } catch (err: unknown) {
          console.error("Error fetching applicants:", err);
          if (err instanceof Error) {
            setError(err.message || "Failed to fetch applicants for this job.");
          } else {
            setError("Failed to fetch applicants for this job.");
          }
          setLoading(false);
        }
      }
    };

    fetchApplicants();
  }, [isLoaded, isSignedIn, user, id]);

  // Function to handle deletion of an applicant
  const handleDelete = async (applicantId: string) => {
    try {
      await axios.delete(`/api/hire-applications/${id}/applicants/${applicantId}`);
      setApplicants((prev) =>
        prev.filter((applicant) => applicant._id !== applicantId)
      );
      toast.success("Applicant deleted successfully", {
        description: "The applicant has been removed from the list.",
        duration: 3000,
      });
    } catch (err: unknown) {
      console.error("Error deleting applicant:", err);
      if (err instanceof Error) {
        toast.error("Failed to delete the applicant", {
          description: err.message || "Please try again later.",
          duration: 3000,
        });
      } else {
        toast.error("Failed to delete the applicant", {
          description: "Please try again later.",
          duration: 3000,
        });
      }
    }
  };

  // Function to handle status update
  const handleStatusUpdate = async (applicantId: string, status: 'reject' | 'ready_to_interview') => {
    try {
      const response = await axios.patch(`/api/hire-applications/${id}/applicants/${applicantId}`, { status });
      // Update the local state
      setApplicants((prev) =>
        prev.map((applicant) =>
          applicant._id === applicantId ? { ...applicant, status } : applicant
        )
      );
      toast.success(`Applicant status updated to '${status.replace('_', ' ')}' and email sent.`, {
        duration: 3000,
      });
    } catch (err: unknown) {
      console.error("Error updating applicant status:", err);
      if (err instanceof Error) {
        toast.error("Failed to update applicant status", {
          description: err.message || "Please try again later.",
          duration: 3000,
        });
      } else {
        toast.error("Failed to update applicant status", {
          description: "Please try again later.",
          duration: 3000,
        });
      }
    }
  };

  // Paginate applicants
  const paginatedApplicants = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return applicants.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, applicants]);

  // Pagination controls
  const totalPages = Math.ceil(applicants.length / ITEMS_PER_PAGE);

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
          <h1 className="text-4xl font-bold mb-4">
            Applicants for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-500">
              {applicants.length > 0 ? `${applicants[0].jobTitle}` : "Job"}
            </span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            View and manage all applicants who have applied to this job.
          </p>
        </div>

        {/* Applicants Container */}
        <div className="max-w-4xl mx-auto space-y-6">
          {loading ? (
            <div className="text-center text-lg animate-pulse">
              Loading applicants...
            </div>
          ) : error ? (
            <Card className="p-8 text-center backdrop-blur-sm bg-background/80 border-pink-500/20">
              <CardContent>
                <p className="text-muted-foreground text-lg">{error}</p>
              </CardContent>
            </Card>
          ) : applicants.length === 0 ? (
            <Card className="p-8 text-center backdrop-blur-sm bg-background/80 border-pink-500/20">
              <CardContent>
                <p className="text-muted-foreground text-lg">
                  No applicants found for this job.
                </p>
              </CardContent>
            </Card>
          ) : (
            paginatedApplicants.map((applicant) => (
              <Card
                key={applicant._id}
                className="group hover:shadow-lg transition-all duration-200 backdrop-blur-sm bg-background/80 border-pink-500/20 hover:border-pink-500/40"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-500">
                        {applicant.firstName} {applicant.lastName}
                      </CardTitle>
                      <p className="text-lg text-muted-foreground">
                        {applicant.email}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`
                        ${
                          applicant.status === "published"
                            ? "bg-green-500/10 text-green-500"
                            : applicant.status === "review"
                            ? "bg-yellow-500/10 text-yellow-500"
                            : applicant.status === "ready_to_interview"
                            ? "bg-blue-500/10 text-blue-500"
                            : "bg-red-500/10 text-red-500"
                        }
                      `}
                    >
                      {applicant.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-4 text-muted-foreground">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-pink-500" />
                      {applicant.city}, {applicant.state}
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="w-4 h-4 mr-2 text-pink-500" />
                      {applicant.jobTitle} at {applicant.jobCompany}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-pink-500" />
                      {formatDistanceToNow(new Date(applicant.postedAt), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a href={applicant.resumeUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">
                        <Download className="w-4 h-4 mr-2" />
                        View Resume
                      </Button>
                    </a>
                  </div>
                </CardContent>

                <CardFooter className="flex space-x-2">
                  <Button
                    variant="ghost"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleStatusUpdate(applicant._id, 'reject')}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-green-500 hover:text-green-700"
                    onClick={() => handleStatusUpdate(applicant._id, 'ready_to_interview')}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Ready to Interview
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the applicant&apos;s data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(applicant._id)}>
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
        {!loading && applicants.length > ITEMS_PER_PAGE && (
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
