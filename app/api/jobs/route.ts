// app/api/jobs/route.ts
import { connectToDatabase } from "@/lib/database";
import { Job } from "@/lib/database/models/Job";
import { NextResponse } from "next/server";


// Your default job data
const defaultJobs = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$120k - $160k",
    description:
      "We're looking for a Senior Frontend Developer to join our growing team. You'll be responsible for building user interfaces using React and leading frontend initiatives.",
    requirements: ["5+ years React experience", "TypeScript expertise", "UI/UX knowledge"],
    posted: "2 days ago",
    tags: ["React", "TypeScript", "Next.js"],
    email: "kanchanakavitha6@gmail.com",
  },
  {
    id: 2,
    title: "Product Designer",
    company: "DesignLabs",
    location: "Remote",
    type: "Contract",
    salary: "$90k - $120k",
    description:
      "Join our design team to create beautiful and functional user experiences for our enterprise clients.",
    requirements: ["3+ years UI/UX experience", "Figma proficiency", "Portfolio required"],
    posted: "1 week ago",
    tags: ["UI/UX", "Figma", "Design Systems"],
    email: "careers.designlabs2@outlook.com",
  },
  {
    id: 3,
    title: "Backend Engineer",
    company: "CloudScale",
    location: "New York, NY",
    type: "Full-time",
    salary: "$130k - $180k",
    description:
      "Looking for a Backend Engineer to help scale our cloud infrastructure and implement new features.",
    requirements: ["Python expertise", "AWS experience", "Microservices architecture"],
    posted: "3 days ago",
    tags: ["Python", "AWS", "Kubernetes"],
    email: "jobs.cloudscale3@hotmail.com",
  },
  {
    id: 4,
    title: "Junior Developer",
    company: "Startup Inc.",
    location: "Remote",
    type: "Part-time",
    salary: "$50k - $70k",
    description:
      "Assist with building scalable web applications and improving our tech stack.",
    requirements: ["JavaScript knowledge", "Eagerness to learn", "Team player"],
    posted: "5 days ago",
    tags: ["JavaScript", "Web Development"],
    email: "apply.startupinc4@gmail.com",
  },
  {
    id: 5,
    title: "Data Scientist",
    company: "DataCrunch",
    location: "Boston, MA",
    type: "Full-time",
    salary: "$100k - $140k",
    description:
      "Analyze data and build predictive models to improve decision-making processes.",
    requirements: ["Python", "Machine Learning", "Data Visualization"],
    posted: "4 days ago",
    tags: ["Python", "Machine Learning", "Data Science"],
    email: "recruitment.datacrunch5@outlook.com",
  },
  {
    id: 6,
    title: "Mobile App Developer",
    company: "Appify",
    location: "Seattle, WA",
    type: "Full-time",
    salary: "$110k - $150k",
    description:
      "Develop and maintain high-quality mobile applications for Android and iOS platforms.",
    requirements: ["Flutter", "React Native", "Mobile UX/UI"],
    posted: "1 day ago",
    tags: ["Flutter", "React Native", "Mobile Development"],
    email: "jobs@appify6@hotmail.com",
  },
  {
    id: 7,
    title: "DevOps Engineer",
    company: "CloudOps",
    location: "Austin, TX",
    type: "Full-time",
    salary: "$120k - $160k",
    description:
      "Implement and manage CI/CD pipelines and ensure the reliability of our cloud infrastructure.",
    requirements: ["Docker", "Kubernetes", "CI/CD"],
    posted: "3 days ago",
    tags: ["DevOps", "Docker", "Kubernetes"],
    email: "devops@cloudops7@gmail.com",
  },
  {
    id: 8,
    title: "Technical Writer",
    company: "DocuTech",
    location: "Remote",
    type: "Contract",
    salary: "$60k - $80k",
    description:
      "Create and maintain technical documentation for our software products.",
    requirements: ["Excellent writing skills", "Technical background", "Attention to detail"],
    posted: "2 weeks ago",
    tags: ["Writing", "Documentation", "Technical"],
    email: "techwriter@docutech8@outlook.com",
  },
  {
    id: 9,
    title: "Systems Administrator",
    company: "NetSecure Solutions",
    location: "Denver, CO",
    type: "Full-time",
    salary: "$80k - $110k",
    description:
      "Manage and maintain IT systems, ensuring uptime and troubleshooting issues efficiently.",
    requirements: ["Linux", "Windows Server", "Networking", "Security Protocols"],
    posted: "5 days ago",
    tags: ["IT Administration", "Systems", "Networking"],
    email: "admin.netsec9@hotmail.com",
  },
  {
    id: 10,
    title: "Cloud Solutions Engineer",
    company: "CloudNet",
    location: "Austin, TX",
    type: "Full-time",
    salary: "$130k - $170k",
    description:
      "Design and implement cloud-based solutions using AWS, Azure, and Google Cloud.",
    requirements: ["AWS Certified Solutions Architect", "Cloud Migration", "CI/CD"],
    posted: "2 days ago",
    tags: ["Cloud Computing", "AWS", "Azure"],
    email: "careers@cloudnet10@gmail.com",
  },
  {
    id: 11,
    title: "Marketing Data Analyst",
    company: "DataViz Analytics",
    location: "San Francisco, CA",
    type: "Contract",
    salary: "$75k - $100k",
    description:
      "Analyze marketing campaigns and provide insights based on data to improve ROI.",
    requirements: ["Google Analytics", "SQL", "Excel", "Data Visualization"],
    posted: "1 week ago",
    tags: ["Data Analysis", "Marketing", "Google Analytics"],
    email: "marketing@dataviz11@outlook.com",
  },
  {
    id: 12,
    title: "Salesforce Administrator",
    company: "Salesforce Pros",
    location: "Chicago, IL",
    type: "Full-time",
    salary: "$90k - $130k",
    description:
      "Manage and configure Salesforce CRM systems, ensuring smooth sales operations.",
    requirements: ["Salesforce Certification", "CRM Systems", "Data Management"],
    posted: "3 days ago",
    tags: ["Salesforce", "CRM", "Sales Operations"],
    email: "admin@salesforcepros12@hotmail.com",
  },
  {
    id: 13,
    title: "Mobile Game Developer",
    company: "GamePro Studios",
    location: "Los Angeles, CA",
    type: "Full-time",
    salary: "$100k - $140k",
    description:
      "Design and develop mobile games, focusing on user experience and engagement.",
    requirements: ["Unity", "C#", "Mobile Game Design", "3D Modelling"],
    posted: "1 week ago",
    tags: ["Game Development", "Mobile", "Unity"],
    email: "games@gamepro13@gmail.com",
  },
  {
    id: 14,
    title: "Cybersecurity Analyst",
    company: "SecureNet",
    location: "San Diego, CA",
    type: "Full-time",
    salary: "$100k - $140k",
    description:
      "Monitor, detect, and respond to cybersecurity threats and vulnerabilities.",
    requirements: ["Penetration Testing", "Firewalls", "Security Incident Response"],
    posted: "3 days ago",
    tags: ["Cybersecurity", "Threat Detection", "Pen Testing"],
    email: "security@securenet14@outlook.com",
  },
  {
    id: 15,
    title: "HR Business Partner",
    company: "PeopleFirst",
    location: "New York, NY",
    type: "Full-time",
    salary: "$120k - $150k",
    description:
      "Collaborate with leadership teams to develop HR strategies that align with business objectives.",
    requirements: ["Employee Relations", "Talent Acquisition", "HR Strategy"],
    posted: "1 week ago",
    tags: ["HR", "Employee Relations", "Strategy"],
    email: "hr@peoplefirst15@hotmail.com",
  },
  {
    id: 16,
    title: "Quality Assurance Engineer",
    company: "SoftTest",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$80k - $110k",
    description:
      "Test and validate software to ensure it meets high-quality standards and is free of bugs.",
    requirements: ["Automated Testing", "Selenium", "Quality Metrics"],
    posted: "4 days ago",
    tags: ["Quality Assurance", "Testing", "Automation"],
    email: "qa@softtest16@gmail.com",
  },
  {
    id: 17,
    title: "Virtual Assistant",
    company: "Admin Solutions",
    location: "Remote",
    type: "Part-time",
    salary: "$40k - $60k",
    description:
      "Provide administrative support to executives, including scheduling, email management, and research.",
    requirements: ["Organizational Skills", "Time Management", "Customer Service"],
    posted: "2 weeks ago",
    tags: ["Admin Support", "Remote", "Virtual Assistant"],
    email: "assistant@adminsolutions17@outlook.com",
  },
  {
    id: 18,
    title: "Brand Strategist",
    company: "Brandify",
    location: "Remote",
    type: "Full-time",
    salary: "$90k - $130k",
    description:
      "Develop and execute brand strategies that position companies for long-term success.",
    requirements: ["Branding", "Marketing Strategy", "Creative Direction"],
    posted: "1 week ago",
    tags: ["Branding", "Strategy", "Marketing"],
    email: "strategy@brandify18@hotmail.com",
  },
  {
    id: 19,
    title: "Customer Success Manager",
    company: "CustomerCare",
    location: "Los Angeles, CA",
    type: "Full-time",
    salary: "$70k - $100k",
    description:
      "Support customers by ensuring they get the most value from products and services.",
    requirements: ["Customer Relations", "Product Knowledge", "Communication Skills"],
    posted: "3 days ago",
    tags: ["Customer Support", "Success", "Customer Engagement"],
    email: "success@customercare19@gmail.com",
  },
  {
    id: 20,
    title: "Video Game Designer",
    company: "Pixel Studios",
    location: "Chicago, IL",
    type: "Full-time",
    salary: "$100k - $150k",
    description:
      "Design video game levels, characters, and gameplay mechanics for immersive gaming experiences.",
    requirements: ["Game Design", "Unity", "3D Modelling", "Creative Problem Solving"],
    posted: "1 week ago",
    tags: ["Game Design", "Unity", "3D Modelling"],
    email: "design@pixelstudios20@outlook.com",
  },
  // ... Add all the rest of your jobs here ...
];

export async function GET() {
  await connectToDatabase();

  // Check if any jobs exist in the database
  const count = await Job.countDocuments();
  if (count === 0) {
    // Insert default jobs if none exist
    // Note: We can omit `id` since it's not part of the schema if it's optional.
    // If you want to store `id`, make sure your schema includes it. Otherwise, remove it.
    const jobsToInsert = defaultJobs.map((job) => {
      return {
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type,
        salary: job.salary,
        description: job.description,
        requirements: job.requirements,
        posted: job.posted,
        tags: job.tags,
        email: job.email,
      };
    });

    await Job.insertMany(jobsToInsert);
  }

  // Retrieve all jobs after seeding (or if already present)
  const jobs = await Job.find().lean();
  return NextResponse.json(jobs);
}
