"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Upload, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import ScanningPopup from "@/components/ScanningPopup";
import IPLimitDialog from "@/components/IPLimitDialog";
import { useUploadThing } from "@/utils/uploadthing";
import { useRouter } from "next/navigation";

const Hero = () => {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>("");
  const [isScanningPopupOpen, setIsScanningPopupOpen] = useState(false);
  const [scanningState, setScanningState] = useState<"scanning" | "complete">(
    "scanning"
  );
  const [userIP, setUserIP] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch and store the user's IP address on component mount
  useEffect(() => {
    const fetchIPAddress = async () => {
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("User's IP Address:", data.ip);
        setUserIP(data.ip);
      } catch (err) {
        console.error("Failed to fetch IP address:", err);
      }
    };

    fetchIPAddress();
  }, []);

  const { startUpload, isUploading } = useUploadThing("resumeUploader", {
    onClientUploadComplete: async (res) => {
      if (res && res.length > 0) {
        const uploadedUrl = res[0].url;

        try {
          const response = await fetch("http://82.180.162.124:8000/check-ats-friendly", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: uploadedUrl }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "An error occurred during analysis.");
          }

          const data = await response.json();

          // Store the analysis result and filename in localStorage
          localStorage.setItem("analysisResult", JSON.stringify(data));
          localStorage.setItem("fileName", files[0].name);

          // Update scanning state to 'complete'
          setScanningState("complete");
        } catch (error) {
          console.error("Error fetching analysis:", error);
          setError("An error occurred while analyzing the resume.");
          setIsScanningPopupOpen(false);
        }
      } else {
        setIsScanningPopupOpen(false);
      }
    },
    onUploadError: (error: Error) => {
      alert(`ERROR! ${error.message}`);
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

  const handleStartAnalysis = async () => {
    if (files.length === 0) {
      setError("Please upload a PDF resume first");
      return;
    }

    if (!userIP) {
      setError("Unable to retrieve your IP address. Please try again.");
      return;
    }

    setError("");
    setIsScanningPopupOpen(true);
    setScanningState("scanning");

    try {
      const response = await fetch("/api/check-ip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: userIP }),
      });

      const result = await response.json();

      if (response.ok) {
        if (result.allowed) {
          // IP not in DB, proceed with upload
          startUpload(files);
        } else {
          // IP already exists, show dialog
          setIsScanningPopupOpen(false);
          setIsDialogOpen(true);
        }
      } else {
        throw new Error(result.message || "An error occurred.");
      }
    } catch (err) {
      console.error("Error checking IP:", err);
      setError("An error occurred while processing your request.");
      setIsScanningPopupOpen(false);
    }
  };

  const handlePopupClose = () => {
    setIsScanningPopupOpen(false);
    setScanningState("scanning");

    // If scanning is complete, redirect to results page
    if (scanningState === "complete") {
      router.push("/result");
    }
  };

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mt-10 relative min-h-[calc(100vh-4rem)] flex items-center">
      {/* Background Elements */}
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

            {/* File Upload Box */}
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

            {/* Start Analysis Button */}
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

            {error && (
              <div className="mt-4 text-red-500">
                <p>{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scanning Popup */}
      <ScanningPopup
        isOpen={isScanningPopupOpen}
        onClose={handlePopupClose}
        fileName={files[0]?.name || ""}
        scanningState={scanningState}
      />

      {/* IP Limit Dialog */}
      <IPLimitDialog 
        isOpen={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
      />
    </div>
  );
};

export default Hero;