// app/hire/page.tsx

"use client";
import React, { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  X,
  Plus,
  Briefcase,
  MapPin,
  DollarSign,
  Tag,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner"; // Ensure 'sonner' is installed and set up

// Type Definitions
type JobData = {
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  email: string;
  tags: string[];
};

// Predefined Tags and Job Types
const AVAILABLE_TAGS = [
  "React",
  "TypeScript",
  "Next.js",
  "Node.js",
  "GraphQL",
  "Docker",
  "Kubernetes",
  "AWS",
  "Firebase",
  "Redux",
  "Tailwind CSS",
  "Jest",
  "Python",
  "Machine Learning",
];

const JOB_TYPES = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "remote", label: "Remote" },
];

const JobPostingPage: React.FC = () => {
  // State Management
  const [jobData, setJobData] = useState<JobData>({
    title: "",
    company: "",
    location: "",
    type: "",
    salary: "",
    description: "",
    requirements: [],
    email: "",
    tags: [],
  });

  // New state for requirement input
  const [requirementInput, setRequirementInput] = useState<string>("");

  // State for form submission status
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Utility Functions
  const updateJobData = useCallback((field: keyof JobData, value: string) => {
    setJobData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const removeRequirementOrTag = useCallback(
    (field: "requirements" | "tags", valueToRemove: string) => {
      setJobData((prev) => ({
        ...prev,
        [field]: prev[field].filter((val) => val !== valueToRemove),
      }));
    },
    []
  );

  // New function to add requirement
  const addRequirement = useCallback(() => {
    if (requirementInput.trim()) {
      setJobData((prev) => ({
        ...prev,
        requirements: [...prev.requirements, requirementInput.trim()],
      }));
      setRequirementInput(""); // Clear input after adding
    }
  }, [requirementInput]);

  const handleSubmit = useCallback(async () => {
    // Basic Validation
    if (!jobData.title || !jobData.company || !jobData.email) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Send POST request to the new API route
      const response = await axios.post("/api/send-job-posting", jobData);

      if (response.status === 200) {
        toast.success("Job posting sent successfully!");
        // Optionally, reset the form
        setJobData({
          title: "",
          company: "",
          location: "",
          type: "",
          salary: "",
          description: "",
          requirements: [],
          email: "",
          tags: [],
        });
      } else {
        toast.error("Failed to send job posting.");
      }
    } catch (error) {
      console.error("Error submitting job posting:", error);
      toast.error("An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }, [jobData]);

  return (
    <div className="relative min-h-screen flex items-center bg-background mt-9">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-transparent to-yellow-500/10 -z-10" />

      {/* Animated Blur Circles */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-700" />

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-card/80 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-white/10">
          <div className="text-center mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Create Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-500 ml-2">
                Job Posting
              </span>
            </h1>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <Label className="flex items-center">
                  <Briefcase className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  Job Title
                </Label>
                <Input
                  placeholder="Senior Frontend Developer"
                  value={jobData.title}
                  onChange={(e) => updateJobData("title", e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="flex items-center">
                  <Briefcase className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  Company
                </Label>
                <Input
                  placeholder="TechCorp Inc."
                  value={jobData.company}
                  onChange={(e) => updateJobData("company", e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  Location
                </Label>
                <Input
                  placeholder="San Francisco, CA"
                  value={jobData.location}
                  onChange={(e) => updateJobData("location", e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="flex items-center">
                  <DollarSign className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  Salary Range
                </Label>
                <Input
                  placeholder="$120k - $160k"
                  value={jobData.salary}
                  onChange={(e) => updateJobData("salary", e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <Label className="flex items-center">
                  <Briefcase className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  Job Type
                </Label>
                <Select
                  onValueChange={(value) => updateJobData("type", value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select Job Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Job Description</Label>
                <Textarea
                  placeholder="Describe the job responsibilities, expectations, and opportunities..."
                  value={jobData.description}
                  onChange={(e) => updateJobData("description", e.target.value)}
                  className="mt-2 min-h-[150px]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Requirements Section */}
            <div className="mt-2">
              <Label className="flex items-center mb-2">
                <Plus className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400 " />
                Requirements
              </Label>
              <div className="flex space-x-2 mb-2">
                <Input
                  placeholder="Add a requirement"
                  value={requirementInput}
                  onChange={(e) => setRequirementInput(e.target.value)}
                  className="flex-grow"
                />
                <Button
                  variant="outline"
                  onClick={addRequirement}
                  disabled={!requirementInput.trim()}
                >
                  Add
                </Button>
              </div>

              {jobData.requirements.length > 0 && (
                <ul className="list-none mt-2 space-y-1 text-sm">
                  {jobData.requirements.map((req) => (
                    <li
                      key={req}
                      className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded"
                    >
                      <span>* {req}</span>
                      <X
                        className="ml-2 h-4 w-4 cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        onClick={() => removeRequirementOrTag("requirements", req)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Tags Section */}
            <div>
              <Label className="flex items-center mt-2">
                <Tag className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                Job Tags
              </Label>
              <Select
                onValueChange={(tag) => {
                  const updatedTags = jobData.tags.includes(tag)
                    ? jobData.tags
                    : [...jobData.tags, tag];
                  setJobData((prev) => ({ ...prev, tags: updatedTags }));
                }}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select Tags" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_TAGS.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {jobData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {jobData.tags.map((tag) => (
                    <div
                      key={tag}
                      className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {tag}
                      <X
                        className="ml-2 h-4 w-4 cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        onClick={() => removeRequirementOrTag("tags", tag)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Email Input */}
          <div className="mt-4">
            <Label>Email Address</Label>
            <Input
              placeholder="Your Email Address"
              value={jobData.email}
              onChange={(e) => updateJobData("email", e.target.value)}
              className="mt-2"
            />
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <Button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600 text-black dark:text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Create Job Posting"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobPostingPage;
