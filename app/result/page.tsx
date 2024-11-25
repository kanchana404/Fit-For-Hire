"use client";
import React, { useEffect, useState } from "react";
import { ArrowLeft, Briefcase, FrownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { jobs } from "@/constants";

interface AnalysisResult {
  feedback: string;
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

function parseFeedback(feedback: string): { [key: string]: string[] } {
  const sections = feedback.split(/(?=^Good Aspects:|^Bad Aspects:|^Suggestions:)/m);
  const result: { [key: string]: string[] } = {};

  sections.forEach((section) => {
    const lines = section.split("\n").filter((line) => line.trim() !== "");
    const headingLine = lines[0].trim().replace(":", "");
    const items = lines.slice(1).map((line) => line.trim());
    result[headingLine] = items;
  });

  return result;
}

// Function to extract skills from feedback
function extractSkills(parsedFeedback: { [key: string]: string[] }): string[] {
  if (!parsedFeedback) return [];

  // Combine skills from different sections
  const skillSources = [
    parsedFeedback['Good Aspects'] || [],
    parsedFeedback['Suggestions'] || []
  ];

  // Flatten and clean skills
  const skills = skillSources.flat()
    .map(skill => skill.toLowerCase())
    // Remove common words and short words
    .filter(skill => 
      skill.length > 2 && 
      !['the', 'and', 'for', 'with', 'your'].includes(skill)
    );

  return [...new Set(skills)]; // Remove duplicates
}

// Function to filter jobs based on CV analysis
function findSuitableJobs(parsedFeedback: { [key: string]: string[] }): Job[] {
  const skills = extractSkills(parsedFeedback);
  
  if (skills.length === 0) return [];

  return jobs.filter(job => {
    // Create a searchable string from job details
    const jobSearchString = [
      job.title.toLowerCase(),
      job.description.toLowerCase(),
      ...job.tags.map(tag => tag.toLowerCase()),
      ...job.requirements.map(req => req.toLowerCase())
    ].join(' ');

    // Count skill matches
    const matchedSkills = skills.filter(skill => 
      jobSearchString.includes(skill)
    );

    // Adjust matching criteria
    return matchedSkills.length > 0;
  });
}

const Result = () => {
  const router = useRouter();
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [parsedFeedback, setParsedFeedback] = useState<{ [key: string]: string[] } | null>(null);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);

  useEffect(() => {
    const storedResult = localStorage.getItem("analysisResult");
    const storedFileName = localStorage.getItem("fileName");

    if (storedResult) {
      const result = JSON.parse(storedResult);
      setAnalysisResult(result);
      const parsed = parseFeedback(result.feedback);
      setParsedFeedback(parsed);
      
      const jobs = findSuitableJobs(parsed);
      setRecommendedJobs(jobs);

      const skills = extractSkills(parsed);
      setExtractedSkills(skills);
    }
    if (storedFileName) {
      setFileName(storedFileName);
    }
  }, []);

  if (!analysisResult || !parsedFeedback) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center mt-10">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-transparent to-yellow-500/10 dark:from-pink-500/5 dark:via-transparent dark:to-yellow-500/5 -z-10" />
      <div className="absolute top-20 right-20 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-700" />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Button
            onClick={() => router.push("/")}
            variant="ghost"
            className="mb-8 hover:bg-transparent hover:text-pink-500 transition-colors group"
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
              {Object.keys(parsedFeedback).map((sectionKey, index) => (
                <div
                  key={index}
                  className="bg-white/50 dark:bg-black/20 rounded-xl shadow-lg p-8 backdrop-blur-sm border border-neutral-200 dark:border-neutral-800"
                >
                  <h2 className="text-2xl font-semibold mb-4">{sectionKey}</h2>
                  <div className="space-y-4">
                    {parsedFeedback[sectionKey].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <p className="text-foreground">{item}</p>
                      </div>
                    ))}
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
                    <div 
                      key={job.id} 
                      className="bg-white dark:bg-neutral-900 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-foreground">{job.title}</h3>
                        <span className="text-sm text-muted-foreground">{job.posted}</span>
                      </div>
                      <div className="mb-4">
                        <p className="text-foreground font-medium">{job.company} • {job.location}</p>
                        <p className="text-muted-foreground">{job.type} • {job.salary}</p>
                      </div>
                      <p className="text-foreground mb-4">{job.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {job.tags.map((tag) => (
                          <span 
                            key={tag} 
                            className="bg-pink-500/10 text-pink-700 dark:text-pink-300 px-2 py-1 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
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

export default Result;