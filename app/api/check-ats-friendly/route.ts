// app/api/check-ats-friendly/route.ts

import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import pdfParse from "pdf-parse";
import * as OpenAI from "openai"; // Namespace Import
import { tmpdir } from "os";
import { writeFile, unlink } from "fs/promises";
import path from "path";

// Initialize OpenAI configuration
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!openaiApiKey) {
  throw new Error(
    "OpenAI API key is not set. Please set the OPENAI_API_KEY environment variable."
  );
}

const configuration = new OpenAI.Configuration({
  apiKey: openaiApiKey,
});
const openai = new OpenAI.OpenAIApi(configuration);

// Define the expected request body structure
interface ResumeURL {
  url: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ResumeURL = await request.json();
    const { url } = body;

    // Step 1: Download the PDF
    const pdfPath = await downloadPdfFromUrl(url);

    try {
      // Step 2: Extract text from the PDF
      const resumeText = await extractTextFromPdf(pdfPath);

      // Step 3: Validate if the text is a resume
      if (!isResume(resumeText)) {
        return NextResponse.json(
          { detail: "The uploaded PDF does not appear to be a resume/CV." },
          { status: 400 }
        );
      }

      // Step 4: Analyze ATS-friendliness using OpenAI
      const analysisResult = await analyzeResume(resumeText);

      return NextResponse.json(analysisResult);
    } finally {
      // Clean up the temporary PDF file
      await deleteFile(pdfPath);
    }
  } catch (error: unknown) {
    console.error("Error in API:", error);
    if (axios.isAxiosError(error) && error.response) {
      // Axios error
      return NextResponse.json(
        {
          detail:
            error.response.data?.detail ||
            "An error occurred during analysis.",
        },
        { status: error.response.status || 500 }
      );
    } else if (error instanceof Error) {
      return NextResponse.json(
        { detail: error.message || "An unexpected error occurred." },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { detail: "An unexpected error occurred." },
        { status: 500 }
      );
    }
  }
}

// Function to download PDF from URL
async function downloadPdfFromUrl(url: string): Promise<string> {
  try {
    const response = await axios.get<ArrayBuffer>(url, {
      responseType: "arraybuffer",
    });

    const contentType = response.headers["content-type"];
    if (!contentType || !contentType.includes("application/pdf")) {
      throw new Error("The URL does not point to a PDF file.");
    }

    const maxSize = 10 * 1024 * 1024; // 10 MB
    const data = response.data;
    if (data.byteLength > maxSize) {
      throw new Error("The PDF file is too large.");
    }

    const tempFilePath = path.join(tmpdir(), `resume_${Date.now()}.pdf`);
    await writeFile(tempFilePath, Buffer.from(data));
    return tempFilePath;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Error downloading PDF: ${error.message}`);
    }
    throw new Error("Unknown error occurred while downloading PDF.");
  }
}

// Function to extract text from PDF
async function extractTextFromPdf(pdfPath: string): Promise<string> {
  try {
    const dataBuffer = await readFile(pdfPath);
    const data = await pdfParse(dataBuffer);
    if (!data.text.trim()) {
      throw new Error("No text could be extracted from the PDF.");
    }
    return data.text;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Error extracting text from PDF: ${error.message}`);
    }
    throw new Error("Unknown error occurred while extracting PDF text.");
  }
}

// Function to check if the text is a resume
function isResume(text: string): boolean {
  const resumeKeywords = [
    "education",
    "experience",
    "skills",
    "professional",
    "objective",
    "summary",
    "certifications",
    "languages",
    "projects",
    "work history",
    "contact",
    "interests",
    "achievements",
    "references",
  ];
  const textLower = text.toLowerCase();
  const keywordMatches = resumeKeywords.reduce(
    (count, keyword) => (textLower.includes(keyword) ? count + 1 : count),
    0
  );
  return keywordMatches >= 3;
}

// Function to analyze resume using OpenAI
async function analyzeResume(resumeText: string) {
  const systemPrompt =
    "You are an expert in resume optimization for Applicant Tracking Systems (ATS).";
  const userPrompt = `
You are an expert in resume analysis and ATS (Applicant Tracking System) optimization. 
Your task is to analyze the following resume and provide a detailed, structured evaluation of its ATS-friendliness.

Instructions:
- Identify both good and bad aspects of the resume.
- Present the feedback in point-wise format.
- For each point, clearly state the aspect and provide explanations or suggestions.
- Extract relevant skills, keywords, and job roles from the resume.

Output Format:
Provide the output in valid JSON format with the following structure:

{
  "feedback": {
    "good_aspects": ["Good point 1", "Good point 2", ...],
    "bad_aspects": ["Bad point 1", "Bad point 2", ...],
    "suggestions": ["Suggestion 1", "Suggestion 2", ...]
  },
  "skills": ["skill1", "skill2", ...]
}

Ensure that the JSON is properly formatted and parsable.

Resume Text:
${resumeText}

Is the resume ATS-friendly? Provide a detailed explanation.
`;

  // Limit the resume_text to avoid exceeding token limit
  const maxChars = 6000; // Adjust based on model's token limit and prompt length
  if (resumeText.length > maxChars) {
    resumeText = resumeText.substring(0, maxChars);
  }

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 1500, // Adjust as needed
    });

    const assistantMessage = response.data.choices[0].message?.content;

    if (!assistantMessage) {
      throw new Error("No response from OpenAI");
    }

    try {
      const result = JSON.parse(assistantMessage);
      return result;
    } catch (jsonError: unknown) {
      if (jsonError instanceof Error) {
        // Attempt to extract JSON from the response
        const jsonMatch = assistantMessage.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsedResult = JSON.parse(jsonMatch[0]);
            return parsedResult;
          } catch (parseError: unknown) {
            if (parseError instanceof Error) {
              throw new Error(`Error parsing JSON: ${parseError.message}`);
            }
          }
        }
        throw new Error(
          `Error parsing assistant's response as JSON: ${jsonError.message}`
        );
      }
      throw new Error("Unknown error occurred during JSON parsing.");
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Error checking ATS-friendliness: ${error.message}`);
    }
    throw new Error("Unknown error occurred during ATS check.");
  }
}

// Function to read file
async function readFile(filePath: string): Promise<Buffer> {
  const fs = await import("fs/promises");
  return fs.readFile(filePath);
}

// Function to delete file
async function deleteFile(filePath: string): Promise<void> {
  try {
    await unlink(filePath);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error deleting file ${filePath}:`, error.message);
    } else {
      console.error(`Error deleting file ${filePath}: Unknown error.`);
    }
  }
}
