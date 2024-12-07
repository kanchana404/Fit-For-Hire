// types/JobData.ts

export interface JobData {
  jobId: string;
  title: string;
  company: string;
  location?: string;
  type?: string;
  salary?: string;
  description?: string;
  requirements: string[];
  email: string;
  tags: string[];
  status: 'published' | 'review' | 'reject';
}
