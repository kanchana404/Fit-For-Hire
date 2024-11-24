"use client";
import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface AnalysisResult {
  feedback: string;
}

// Function to parse the feedback into structured sections
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

const Result = () => {
  const router = useRouter();
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [parsedFeedback, setParsedFeedback] = useState<{ [key: string]: string[] } | null>(null);

  useEffect(() => {
    const storedResult = localStorage.getItem("analysisResult");
    const storedFileName = localStorage.getItem("fileName");

    if (storedResult) {
      const result = JSON.parse(storedResult);
      setAnalysisResult(result);
      setParsedFeedback(parseFeedback(result.feedback));
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
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            onClick={() => router.push("/")}
            variant="ghost"
            className="mb-8 hover:bg-transparent hover:text-pink-500 transition-colors group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Upload
          </Button>

          {/* Main Content */}
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Analysis{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-500">
                  Results
                </span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Detailed ATS feedback for {fileName}
              </p>
            </div>

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

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
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
    </div>
  );
};

export default Result;
