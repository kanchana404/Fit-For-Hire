"use client";
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Upload, FileText, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUploadThing } from "@/utils/uploadthing";

interface JobApplicationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
  jobCompany: string;
}

interface PersonalDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

const JobApplicationPopup: React.FC<JobApplicationPopupProps> = ({
  isOpen,
  onClose,
  jobTitle,
  jobCompany,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<{ [key in keyof PersonalDetails | "resume"]?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [personalDetails, setPersonalDetails] = useState<PersonalDetails>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const { startUpload, isUploading } = useUploadThing("resumeUploader", {
    onClientUploadComplete: async (res) => {
      if (res && res.length > 0) {
        const uploadedUrl = res[0].url;
        const applicationData = {
          ...personalDetails,
          resumeUrl: uploadedUrl,
          jobTitle,
          jobCompany,
        };
        console.log("Application submitted", applicationData);
        onClose();
      }
    },
    onUploadError: (error: Error) => {
      alert(`ERROR! ${error.message}`);
    },
  });

  const validateField = (name: keyof PersonalDetails, value: string) => {
    switch (name) {
      case "firstName":
      case "lastName":
        return value.trim().length >= 2 ? "" : "Name must be at least 2 characters";
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? "" : "Invalid email address";
      case "phone":
        const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
        return phoneRegex.test(value) ? "" : "Invalid phone number";
      case "zipCode":
        return value.trim().length >= 4 ? "" : "Invalid zip code";
      default:
        return "";
    }
  };

  const handlePersonalDetailsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const fieldName = name as keyof PersonalDetails;
    const error = validateField(fieldName, value);

    setPersonalDetails((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [fieldName]: error,
    }));
  };

  const validateAllFields = () => {
    const newErrors: { [key in keyof PersonalDetails | "resume"]?: string } = {};

    const requiredFields: (keyof PersonalDetails)[] = ["firstName", "lastName", "email", "phone"];
    requiredFields.forEach((field) => {
      const error = validateField(field, personalDetails[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    if (files.length === 0) {
      newErrors["resume"] = "Please upload a PDF resume";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const invalidFiles = selectedFiles.filter(
      (file) => file.type !== "application/pdf"
    );

    if (invalidFiles.length > 0) {
      setErrors((prev) => ({
        ...prev,
        resume: "Please upload PDF files only",
      }));
      return;
    }

    const newErrors = { ...errors };
    delete newErrors.resume;
    setErrors(newErrors);
    setFiles(selectedFiles);
  };

  const handleStartApplication = () => {
    if (validateAllFields()) {
      startUpload(files);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            Apply for {jobTitle} at {jobCompany}
          </DialogTitle>
          <DialogDescription>
            Complete your application by filling out your details and uploading
            your resume
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          {/* First row: Name */}
          <div className="col-span-2 grid grid-cols-2 gap-4">
            <div>
              <Input
                name="firstName"
                value={personalDetails.firstName}
                onChange={handlePersonalDetailsChange}
                placeholder="First Name*"
                required
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>
            <div>
              <Input
                name="lastName"
                value={personalDetails.lastName}
                onChange={handlePersonalDetailsChange}
                placeholder="Last Name*"
                required
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Contact Details */}
          <div className="col-span-2">
            <Input
              name="email"
              type="email"
              value={personalDetails.email}
              onChange={handlePersonalDetailsChange}
              placeholder="Email Address*"
              required
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div className="col-span-2">
            <Input
              name="phone"
              type="tel"
              value={personalDetails.phone}
              onChange={handlePersonalDetailsChange}
              placeholder="Phone Number*"
              required
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Address Details */}
          <div className="col-span-2">
            <Input
              name="address"
              value={personalDetails.address}
              onChange={handlePersonalDetailsChange}
              placeholder="Street Address"
            />
          </div>

          <div>
            <Input
              name="city"
              value={personalDetails.city}
              onChange={handlePersonalDetailsChange}
              placeholder="City"
            />
          </div>
          <div>
            <Input
              name="state"
              value={personalDetails.state}
              onChange={handlePersonalDetailsChange}
              placeholder="State/Province"
            />
          </div>

          <div className="col-span-2">
            <Input
              name="zipCode"
              value={personalDetails.zipCode}
              onChange={handlePersonalDetailsChange}
              placeholder="Zip/Postal Code"
            />
            {errors.zipCode && (
              <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>
            )}
          </div>

          {/* Resume Upload */}
          <div className="col-span-2">
            <div
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "w-full p-6 rounded-lg cursor-pointer",
                "transition-all duration-300 ease-in-out",
                "border-2 border-dashed",
                "bg-white/50 dark:bg-black/20",
                files.length > 0
                  ? "border-green-500 dark:border-green-500"
                  : "hover:border-pink-500 dark:hover:border-pink-500 border-neutral-200 dark:border-neutral-800",
                "relative overflow-hidden group"
              )}
            >
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
                        or click to upload (PDF only)
                      </p>
                    </div>
                  )}
                </div>

                {errors.resume && (
                  <p className="text-red-500 text-sm">{errors.resume}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={handleStartApplication}
          className="w-full bg-gradient-to-r from-pink-500 to-yellow-500 text-white hover:opacity-90"
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Submit Application"}
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default JobApplicationPopup;
