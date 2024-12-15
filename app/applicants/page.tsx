// app/applicants/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { 
  Briefcase, 
  Clock, 
  DollarSign, 
  MapPin, 
  ArrowRight,
  Trash2
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";

interface Job {
  _id: string;
  jobId: string;
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
  status: string;
  postedAt: string | null;
  applicantCount: number;
}

const ITEMS_PER_PAGE = 5;

const HireApplicationsPage = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const [applications, setApplications] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      if (isLoaded && isSignedIn && user) {
        try {
          setLoading(true);
          const response = await axios.get<Job[]>("/api/hire-applications");
          setApplications(response.data);
          setLoading(false);
        } catch (err: any) {
          console.error("Error fetching applications:", err);
          setError("Failed to fetch your hire applications.");
          setLoading(false);
        }
      }
    };

    fetchApplications();
  }, [isLoaded, isSignedIn, user]);

  // Function to handle deletion
  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      await axios.delete(`/api/hire-applications/${deletingId}`);
      setApplications(prev => prev.filter(app => app._id !== deletingId));
      toast.success("Application deleted successfully", {
        description: "The job application has been removed from your list.",
        duration: 3000,
      });
      setDeletingId(null);
    } catch (err: any) {
      console.error("Error deleting application:", err);
      toast.error("Failed to delete the hire application", {
        description: "Please try again later.",
        duration: 3000,
      });
    }
  };

  // Paginate applications
  const paginatedApplications = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return applications.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, applications]);

  // Pagination controls
  const totalPages = Math.ceil(applications.length / ITEMS_PER_PAGE);

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
            Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-500">
              Hire Applications
            </span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Track and manage your job application journey with ease.
          </p>
        </div>

        {/* Applications Container */}
        <div className="max-w-4xl mx-auto space-y-6">
          {loading ? (
            <div className="text-center text-lg animate-pulse">
              Loading applications...
            </div>
          ) : error ? (
            <Card className="p-8 text-center backdrop-blur-sm bg-background/80 border-pink-500/20">
              <CardContent>
                <p className="text-muted-foreground text-lg">{error}</p>
              </CardContent>
            </Card>
          ) : applications.length === 0 ? (
            <Card className="p-8 text-center backdrop-blur-sm bg-background/80 border-pink-500/20">
              <CardContent>
                <p className="text-muted-foreground text-lg">
                  No hire applications found. Start exploring job opportunities!
                </p>
              </CardContent>
            </Card>
          ) : (
            paginatedApplications.map((app) => (
              <Card
                key={app._id}
                className="group hover:shadow-lg transition-all duration-200 backdrop-blur-sm bg-background/80 border-pink-500/20 hover:border-pink-500/40"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-500">
                        {app.title}
                      </CardTitle>
                      <p className="text-lg text-muted-foreground">{app.company}</p>
                    </div>
                    <Badge 
                      variant="secondary"
                      className={`
                        ${
                          app.status === "published" 
                            ? "bg-green-500/10 text-green-500"
                            : app.status === "review"
                            ? "bg-yellow-500/10 text-yellow-500"
                            : "bg-red-500/10 text-red-500"
                        }
                      `}
                    >
                      {app.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-4 text-muted-foreground">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-pink-500" />
                      {app.location}
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="w-4 h-4 mr-2 text-pink-500" />
                      {app.type}
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-pink-500" />
                      {app.salary}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-pink-500" />
                      {app.postedAt
                        ? formatDistanceToNow(new Date(app.postedAt), { addSuffix: true })
                        : "N/A"}
                    </div>
                  </div>

                  <p className="text-muted-foreground line-clamp-3">{app.description}</p>

                  {app.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {app.tags.map((tag, index) => (
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

                  <div className="mt-2">
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                      {app.applicantCount} Applicants
                    </Badge>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline"
                    className="bg-gradient-to-r from-pink-500 to-yellow-500 text-white hover:opacity-90 transition-opacity group"
                  >
                    View Details
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => setDeletingId(app._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your job application.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>
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
        {!loading && applications.length > ITEMS_PER_PAGE && (
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

export default HireApplicationsPage;
