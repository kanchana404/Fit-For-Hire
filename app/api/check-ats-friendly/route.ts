import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import axios from 'axios';
import pdf from 'pdf-parse';
import { createWriteStream, unlinkSync, existsSync } from 'fs';
import { pipeline } from 'stream/promises';
import { tmpdir } from 'os';
import path from 'path';

// OpenAI Configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Interfaces
interface ResumeURL {
  url: string;
}

interface ATSFeedback {
  feedback: {
    good_aspects: string[];
    bad_aspects: string[];
    suggestions: string[];
  };
  skills: string[];
}

// Utility Functions
async function downloadPDFFromUrl(url: string): Promise<string> {
  try {
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0'
      },
      maxContentLength: 10 * 1024 * 1024 // 10 MB
    });

    // Validate content type
    const contentType = response.headers['content-type'];
    if (!contentType || !contentType.includes('application/pdf')) {
      throw new Error('The URL does not point to a PDF file.');
    }

    // Create a temporary file
    const tempFilePath = path.join(tmpdir(), `resume_${Date.now()}.pdf`);
    await pipeline(
      require('stream').Readable.from(response.data),
      createWriteStream(tempFilePath)
    );

    return tempFilePath;
  } catch (error) {
    throw new Error(`Error downloading PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function extractTextFromPDF(pdfPath: string): Promise<string> {
  try {
    const dataBuffer = require('fs').readFileSync(pdfPath);
    const pdfData = await pdf(dataBuffer);
    const text = pdfData.text;

    if (!text.trim()) {
      throw new Error('No text could be extracted from the PDF.');
    }

    return text;
  } catch (error) {
    throw new Error(`Error extracting text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function isResume(text: string): boolean {
  const resumeKeywords = [
    "education", "experience", "skills", "professional", "objective",
    "summary", "certifications", "languages", "projects", "work history",
    "contact", "interests", "achievements", "references"
  ];

  const textLower = text.toLowerCase();
  const keywordMatches = resumeKeywords.filter(keyword => textLower.includes(keyword));

  return keywordMatches.length >= 3;
}

async function checkATSFriendly(resumeText: string): Promise<ATSFeedback> {
  const systemPrompt = "You are an expert in resume optimization for Applicant Tracking Systems (ATS).";
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
${resumeText.slice(0, 6000)}

Is the resume ATS-friendly? Provide a detailed explanation.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    });

    const assistantMessage = response.choices[0].message.content || '';

    // Try parsing the JSON
    try {
      return JSON.parse(assistantMessage);
    } catch {
      // If parsing fails, try extracting JSON using regex
      const jsonMatch = assistantMessage.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Could not parse response as JSON');
    }
  } catch (error) {
    throw new Error(`Error checking ATS-friendliness: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Next.js API Route Handler
export async function POST(request: NextRequest) {
  try {
    const req = await request.json() as ResumeURL;
    const { url } = req;

    // Download PDF
    const pdfPath = await downloadPDFFromUrl(url);

    try {
      // Extract text
      const resumeText = await extractTextFromPDF(pdfPath);

      // Validate if the PDF is a resume
      if (!isResume(resumeText)) {
        return NextResponse.json({ 
          error: 'The uploaded PDF does not appear to be a resume/CV.' 
        }, { status: 400 });
      }

      // Check ATS-friendliness
      const result = await checkATSFriendly(resumeText);
      return NextResponse.json(result);
    } finally {
      // Clean up temporary file
      if (existsSync(pdfPath)) {
        unlinkSync(pdfPath);
      }
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    }, { status: 500 });
  }
}