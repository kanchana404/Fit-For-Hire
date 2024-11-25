"use client";
import React, { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Briefcase, Clock, DollarSign, FrownIcon, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { jobs } from "@/constants";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AnalysisFeedback {
  good_aspects: string[];
  bad_aspects: string[];
  suggestions: string[];
}

interface AnalysisResult {
  feedback: AnalysisFeedback;
  skills: string[];
}

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  posted: string;
  tags: string[];
}

function findSuitableJobs(skills: string[]): Job[] {
  if (!skills || skills.length === 0) return [];

  return jobs.filter((job) => {
    // Create a searchable string from job details
    const jobSearchString = [
      job.title.toLowerCase(),
      job.description.toLowerCase(),
      ...job.tags.map((tag) => tag.toLowerCase()),
      ...job.requirements.map((req) => req.toLowerCase()),
    ].join(" ");

    // Count skill matches
    const matchedSkills = skills.filter((skill) =>
      jobSearchString.includes(skill.toLowerCase())
    );

    // Adjust matching criteria
    return matchedSkills.length > 0;
  });
}

const Result = () => {
  const router = useRouter();
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const storedResult = localStorage.getItem("analysisResult");
    const storedFileName = localStorage.getItem("fileName");

    if (storedResult) {
      try {
        const result: AnalysisResult = JSON.parse(storedResult);
        // Validate structure
        if (
          !result.feedback ||
          !Array.isArray(result.feedback.good_aspects) ||
          !Array.isArray(result.feedback.bad_aspects) ||
          !Array.isArray(result.feedback.suggestions) ||
          !Array.isArray(result.skills)
        ) {
          throw new Error("Invalid analysis result structure.");
        }
        setAnalysisResult(result);

        const skills = result.skills || [];
        setExtractedSkills(skills);

        const jobs = findSuitableJobs(skills);
        setRecommendedJobs(jobs);
      } catch (err) {
        console.error("Error parsing analysis result:", err);
        setError("Failed to load analysis results. Please try uploading your resume again.");
      }
    }
    if (storedFileName) {
      setFileName(storedFileName);
    }
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button
            onClick={() => router.push("/")}
            className="bg-gradient-to-r from-pink-500 to-yellow-500 text-white hover:opacity-90"
          >
            Return to Upload
          </Button>
        </div>
      </div>
    );
  }

  if (!analysisResult) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <Button
          onClick={() => router.push("/")}
          className="bg-gradient-to-r from-pink-500 to-yellow-500 text-white hover:opacity-90"
        >
          Return to Upload
        </Button>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center mt-10 px-4">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-transparent to-yellow-500/10 dark:from-pink-500/5 dark:via-transparent dark:to-yellow-500/5 -z-10" />
      <div className="absolute top-20 right-20 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-700" />

      <div className="container mx-auto py-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Button
            onClick={() => router.push("/")}
            variant="ghost"
            className="mb-8 hover:bg-transparent hover:text-pink-500 transition-colors group flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Upload
          </Button>

          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Analysis{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-500">
                Results
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mt-2">
              Detailed ATS feedback for {fileName}
            </p>
          </div>

          {/* Main Content - Two Column Layout */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Column - Feedback Sections */}
            <div className="w-full md:w-1/2 space-y-8">
              {/* Render Feedback Sections */}
              {Object.entries(analysisResult.feedback).map(([sectionKey, points], index) => (
                <div
                  key={index}
                  className="bg-white/50 dark:bg-black/20 rounded-xl shadow-lg p-8 backdrop-blur-sm border border-neutral-200 dark:border-neutral-800"
                >
                  <h2 className="text-2xl font-semibold mb-4 capitalize">
                    {sectionKey.replace('_', ' ')}
                  </h2>
                  <div className="space-y-4">
                    {Array.isArray(points) ? (
                      points.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <CheckCircleIcon className="mt-1 w-5 h-5 text-pink-500" />
                          <p className="text-foreground">{item}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-red-500">Invalid data format for {sectionKey}.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column - Recommended Jobs */}
            <div className="w-full md:w-1/2 space-y-8">
              <div
                className="bg-white/50 dark:bg-black/20 rounded-xl shadow-lg p-8 backdrop-blur-sm border border-neutral-200 dark:border-neutral-800"
              >
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                  <Briefcase className="h-6 w-6 text-pink-500" />
                  Recommended Jobs
                </h2>

                {/* No Jobs Found State */}
                {recommendedJobs.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <FrownIcon className="h-16 w-16 text-pink-500 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Matching Jobs Found</h3>
                    <p className="text-muted-foreground mb-4">
                      We couldn&apos;t find any jobs matching your profile at the moment.
                    </p>
                    {extractedSkills.length > 0 && (
                      <div>
                        <p className="text-foreground mb-2">Skills we identified:</p>
                        <div className="flex flex-wrap justify-center gap-2">
                          {extractedSkills.map((skill) => (
                            <span
                              key={skill}
                              className="bg-pink-500/10 text-pink-700 dark:text-pink-300 px-2 py-1 rounded-full text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Jobs Listing */}
                <div className="space-y-4">
                  {recommendedJobs.map((job) => (
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
                          <Button className="bg-gradient-to-r from-pink-500 to-yellow-500 text-white hover:opacity-90 transition-opacity group flex items-center">
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
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <Button
              onClick={() => {
                localStorage.removeItem("analysisResult");
                localStorage.removeItem("fileName");
                router.push("/");
              }}
              className="px-8 py-6 bg-gradient-to-r from-pink-500 to-yellow-500 text-white font-medium hover:opacity-90 transition-opacity group"
            >
              Analyze Another Resume
            </Button>
            <Button
              onClick={() => window.print()}
              variant="outline"
              className="px-8 py-6 border-pink-500/20 hover:bg-pink-500/5 transition-colors"
            >
              Save Results
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Icon Component for Feedback Points
const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4"
    />
  </svg>
);

export default Result;
