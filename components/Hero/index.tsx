"use client";
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Upload, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import ScanningPopup from "@/components/ScanningPopup";
import { useUploadThing } from "@/utils/uploadthing";

const Hero = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>("");
  const [isScanningPopupOpen, setIsScanningPopupOpen] = useState(false);
  const [scanningState, setScanningState] = useState<"scanning" | "complete">(
    "scanning"
  );
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading } = useUploadThing("resumeUploader", {
    onClientUploadComplete: async (res) => {
      if (res && res.length > 0) {
        const uploadedUrl = res[0].url;

        try {
          // Send POST request to the API
          const response = await fetch(
            "http://127.0.0.1:8000/check-ats-friendly",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url: uploadedUrl }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.detail || "An error occurred during analysis."
            );
          }

          const data = await response.json();

          // Save the analysis result
          setAnalysisResult(data);

          // Update scanning state to 'complete'
          setScanningState("complete");
        } catch (error) {
          console.error("Error fetching analysis:", error);
          setError(
            "An error occurred while analyzing the resume."
          );
          // Close the popup in case of error
          setIsScanningPopupOpen(false);
        }
      } else {
        // Close the popup if upload fails
        setIsScanningPopupOpen(false);
      }
    },
    onUploadError: (error: Error) => {
      alert(`ERROR! ${error.message}`);
      // Close the popup in case of upload error
      setIsScanningPopupOpen(false);
    },
  });

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

    // Reset previous analysis result and error
    setAnalysisResult(null);
    setError("");

    // Open the scanning popup and set scanning state
    setIsScanningPopupOpen(true);
    setScanningState("scanning");

    // Start the upload process
    startUpload(files);
  };

  const handlePopupClose = () => {
    setIsScanningPopupOpen(false);
    setScanningState("scanning"); // Reset scanning state
  };

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mt-10 relative min-h-[calc(100vh-4rem)] flex items-center">
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

              <Input
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
                disabled={files.length === 0 || isUploading}
              >
                {isUploading ? "Uploading..." : "Start Analysis"}
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Display the analysis result if available and popup is closed */}
            {!isScanningPopupOpen && analysisResult && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold">Analysis Result</h2>
                <div className="text-left bg-gray-100 p-4 rounded overflow-x-auto text-black">
                  {analysisResult.feedback
                    .split("\n")
                    .filter((line: string) => line.trim() !== "")
                    .map((line: string, index: number) => (
                      <p key={index}>{line}</p>
                    ))}
                </div>
              </div>
            )}

            {/* Display error if any */}
            {error && (
              <div className="mt-4 text-red-500">
                <p>{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ScanningPopup
        isOpen={isScanningPopupOpen}
        onClose={handlePopupClose}
        fileName={files[0]?.name || ""}
        scanningState={scanningState}
      />
    </div>
  );
};

export default Hero;
