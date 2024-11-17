"use client";
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Upload, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const Hero = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const features = [
    "AI-Powered Resume Screening",
    "95% Parsing Accuracy",
    "Instant Job Match Analysis",
  ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);

    const invalidFiles = selectedFiles.filter(
      (file) => file.type !== "application/pdf"
    );

    if (invalidFiles.length > 0) {
      setError("Please upload PDF files only");
      return;
    }

    setError("");
    setFiles(selectedFiles);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);

    const invalidFiles = droppedFiles.filter(
      (file) => file.type !== "application/pdf"
    );

    if (invalidFiles.length > 0) {
      setError("Please upload PDF files only");
      return;
    }

    setError("");
    setFiles(droppedFiles);
  };

  const handleStartAnalysis = () => {
    if (files.length === 0) {
      setError("Please upload a PDF resume first");
      return;
    }
    console.log("Starting analysis for files:", files);
  };

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center">
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-transparent to-yellow-500/10 dark:from-pink-500/5 dark:via-transparent dark:to-yellow-500/5 -z-10" />

      <div className="absolute top-20 right-20 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-700" />

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground">
              Transform Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-500">
                Hiring Process
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered ATS simplifies resume screening, helping you find
              the perfect candidates faster than ever before.
            </p>

            <div className="flex flex-col md:flex-row justify-center gap-4 py-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center space-x-2 text-muted-foreground"
                >
                  <CheckCircle className="w-5 h-5 text-pink-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <div
              onClick={handleBoxClick}
              className={cn(
                "w-full max-w-2xl mx-auto p-8 rounded-lg cursor-pointer",
                "transition-all duration-300 ease-in-out",
                "border-2 border-dashed",
                "bg-white/50 dark:bg-black/20",
                files.length > 0
                  ? "border-green-500 dark:border-green-500"
                  : "hover:border-pink-500 dark:hover:border-pink-500 border-neutral-200 dark:border-neutral-800",
                "relative overflow-hidden group"
              )}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-transparent to-yellow-500/5 dark:from-pink-500/5 dark:via-transparent dark:to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={handleFileChange}
              />

              <div className="relative flex flex-col items-center gap-4">
                <div className="p-4 rounded-full bg-pink-500/10 group-hover:bg-pink-500/20 transition-colors duration-300">
                  {files.length > 0 ? (
                    <FileText className="w-8 h-8 text-pink-500" />
                  ) : (
                    <Upload className="w-8 h-8 text-pink-500" />
                  )}
                </div>

                <div className="text-center">
                  {files.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-lg font-medium">{files[0].name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(files[0].size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-lg font-medium">
                        Drop your resume here
                      </p>
                      <p className="text-sm text-muted-foreground">
                        or click anywhere in this box to upload
                      </p>
                    </div>
                  )}
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={handleStartAnalysis}
                className="px-8 bg-gradient-to-r h-12 from-pink-500 to-yellow-500 text-white font-medium hover:opacity-90 transition-opacity group"
                disabled={files.length === 0}
              >
                Start Analysis
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
