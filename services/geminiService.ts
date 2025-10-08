import { GoogleGenAI, Type } from "@google/genai";
import { CandidateStatus, CandidateAnalysis, CompanyPerk } from "../types";

// FIX: Initialize GoogleGenAI with a named apiKey parameter as per the guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        summary: { type: Type.STRING, description: "A concise summary of the candidate's profile and suitability for the role." },
        skills: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of key technical and soft skills."
        },
        experienceYears: { type: Type.NUMBER, description: "Total years of relevant professional experience." },
        education: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of degrees or educational qualifications."
        },
        fitScore: { type: Type.NUMBER, description: "A score from 1-10 indicating the candidate's fit for the role." },
        workHistory: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    company: { type: Type.STRING },
                    industry: { type: Type.STRING, description: "The industry sector of the company (e.g., 'Tech', 'Finance')." },
                    startDate: { type: Type.STRING, description: "Format: YYYY-MM" },
                    endDate: { type: Type.STRING, description: "Format: YYYY-MM or 'Present'" },
                    description: { type: Type.STRING, description: "Brief description of responsibilities and achievements." }
                },
                required: ['title', 'company', 'startDate', 'endDate', 'description']
            }
        },
        recommendedAction: { type: Type.STRING, description: "The single most appropriate next step for this candidate (e.g., 'Request Skill Check', 'Shortlist for Interview', 'Reject')." },
        actionJustification: { type: Type.STRING, description: "A brief, one-sentence justification for the recommended action." }
    },
    required: ['summary', 'skills', 'experienceYears', 'education', 'fitScore', 'workHistory', 'recommendedAction', 'actionJustification']
};

type AnalysisResult = CandidateAnalysis & {
    recommendedAction: string;
    actionJustification: string;
}

export async function analyzeResume(jobRole: string, resume: { text: string } | { images: { mimeType: string, data: string }[] }): Promise<AnalysisResult> {
    const prompt = `Analyze the following resume for a "${jobRole}" position. Extract key information and assess the candidate's suitability. If multiple images are provided, they represent pages of a single document; combine their content for the analysis.`;

    const contents = 'text' in resume
        ? [ { text: prompt }, { text: resume.text } ]
        : [ { text: prompt }, ...resume.images.map(image => ({ inlineData: image })) ];

    const response = await ai.models.generateContent({
        // FIX: Use the 'gemini-2.5-flash' model as specified in the guidelines.
        model: 'gemini-2.5-flash',
        contents: { parts: contents },
        config: {
            responseMimeType: 'application/json',
            responseSchema: analysisSchema,
        }
    });

    const resultJson = response.text.trim();
    return JSON.parse(resultJson);
}

export async function extractTextFromImages(images: { mimeType: string, data: string }[]): Promise<string> {
    const prompt = "These images are pages of a resume. Extract all the text from them, preserving the original formatting and order as much as possible, to reconstruct the full resume text.";
    
    const contents = [ { text: prompt }, ...images.map(image => ({ inlineData: image })) ];

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: contents },
    });
    
    return response.text.trim();
}

export async function generateAnonymizedResume(resumeText: string): Promise<string> {
    const response = await ai.models.generateContent({
        // FIX: Use the 'gemini-2.5-flash' model as specified in the guidelines.
        model: 'gemini-2.5-flash',
        contents: `Anonymize the following resume text by removing all personally identifiable information (PII) such as name, email, phone number, and address. Replace the name with "[Candidate]". Do not remove company names or schools.\n\n---\n\n${resumeText}`,
    });
    return response.text.trim();
}

export async function generateStatusChangeEmail(candidateName: string, role: string, newStatus: CandidateStatus): Promise<{ subject: string, body: string }> {
    const response = await ai.models.generateContent({
        // FIX: Use the 'gemini-2.5-flash' model as specified in the guidelines.
        model: 'gemini-2.5-flash',
        contents: `Generate a professional and friendly email to a job candidate named ${candidateName} about their application for the ${role} position. The new status is "${newStatus}". Return a JSON object with "subject" and "body" fields. The tone should be encouraging, even if the status is a rejection.`,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    subject: { type: Type.STRING },
                    body: { type: Type.STRING }
                },
                required: ['subject', 'body']
            }
        }
    });
    return JSON.parse(response.text.trim());
}


export async function generateCompanyPerks(role: string): Promise<CompanyPerk[]> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a list of 4 appealing and role-specific company perks for a "${role}" position. For each perk, provide a title, a short description, and an icon name. The allowed icon names are "Trophy", "Gift", "ClipboardDocumentCheck", and "ChatBubbleLeftRight".`,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        icon: { type: Type.STRING },
                        title: { type: Type.STRING },
                        description: { type: Type.STRING }
                    },
                    required: ['icon', 'title', 'description']
                }
            }
        }
    });
    return JSON.parse(response.text.trim());
}