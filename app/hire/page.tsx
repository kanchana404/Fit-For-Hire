"use client"
import React, { useState, useCallback } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { X, Plus, Briefcase, MapPin, DollarSign, Tag } from "lucide-react"

// Type Definitions
type JobData = {
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string;
  email: string;
  tags: string;
}

// Predefined Tags and Job Types
const AVAILABLE_TAGS = [
  "React", "TypeScript", "Next.js", "Node.js", "GraphQL", 
  "Docker", "Kubernetes", "AWS", "Firebase", "Redux", 
  "Tailwind CSS", "Jest", "Python", "Machine Learning"
]

const JOB_TYPES = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "remote", label: "Remote" }
]

const JobPostingPage: React.FC = () => {
  // State Management
  const [jobData, setJobData] = useState<JobData>({
    title: "", 
    company: "", 
    location: "", 
    type: "", 
    salary: "", 
    description: "", 
    requirements: "", 
    email: "", 
    tags: ""
  })

  // Utility Functions
  const updateJobData = useCallback((field: keyof JobData, value: string) => {
    setJobData(prev => ({...prev, [field]: value}))
  }, [])

  const addRequirementOrTag = useCallback((field: 'requirements' | 'tags', currentValue: string) => {
    const trimmedValue = currentValue.trim()
    if (trimmedValue) {
      setJobData(prev => ({
        ...prev,
        [field]: prev[field] ? `${prev[field]}, ${trimmedValue}` : trimmedValue
      }))
    }
  }, [])

  const removeRequirementOrTag = useCallback((field: 'requirements' | 'tags', valueToRemove: string) => {
    setJobData(prev => {
      const currentValues = prev[field].split(', ').filter(val => val.trim() !== valueToRemove.trim())
      return {
        ...prev,
        [field]: currentValues.join(', ')
      }
    })
  }, [])

  const handleSubmit = useCallback(() => {
    // Validation can be added here
    console.log("Job Data Submitted:", jobData)
    // Potentially add toast notification or modal for successful submission
  }, [jobData])

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
                  onChange={(e) => updateJobData('title', e.target.value)}
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
                  onChange={(e) => updateJobData('company', e.target.value)}
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
                  onChange={(e) => updateJobData('location', e.target.value)}
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
                  onChange={(e) => updateJobData('salary', e.target.value)}
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
                <Select onValueChange={(value) => updateJobData('type', value)}>
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
                  onChange={(e) => updateJobData('description', e.target.value)}
                  className="mt-2 min-h-[150px]"
                />
              </div>

              {/* Requirements Section */}
              <div>
                <Label className="flex items-center">
                  <Plus className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  Requirements
                </Label>
                <div className="mt-2">
                  <Textarea 
                    placeholder="Enter job requirements (comma-separated)" 
                    value={jobData.requirements}
                    onChange={(e) => updateJobData('requirements', e.target.value)}
                    className="mb-2"
                  />
                  {jobData.requirements && (
                    <div className="flex flex-wrap gap-2">
                      {jobData.requirements.split(',').map((req) => {
                        const trimmedReq = req.trim()
                        return trimmedReq ? (
                          <div 
                            key={trimmedReq} 
                            className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm flex items-center"
                          >
                            {trimmedReq}
                            <X 
                              className="ml-2 h-4 w-4 cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" 
                              onClick={() => removeRequirementOrTag('requirements', trimmedReq)} 
                            />
                          </div>
                        ) : null
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Tags Section */}
              <div>
                <Label className="flex items-center">
                  <Tag className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  Job Tags
                </Label>
                <div className="mt-2">
                  <Select 
                    onValueChange={(tag) => {
                      const updatedTags = jobData.tags 
                        ? `${jobData.tags}, ${tag}` 
                        : tag;
                      updateJobData('tags', updatedTags);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Tags" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_TAGS.map((tag) => (
                        <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {jobData.tags && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {jobData.tags.split(',').map((tag) => {
                        const trimmedTag = tag.trim()
                        return trimmedTag ? (
                          <div 
                            key={trimmedTag} 
                            className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm flex items-center"
                          >
                            {trimmedTag}
                            <X 
                              className="ml-2 h-4 w-4 cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" 
                              onClick={() => removeRequirementOrTag('tags', trimmedTag)} 
                            />
                          </div>
                        ) : null
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <Button 
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600"
            >
              Create Job Posting
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobPostingPage
