// Fix: Import GoogleGenAI and Type according to guidelines
import { GoogleGenAI, Type } from "@google/genai";
// Fix: Import necessary types from the local types file
import { CandidateAnalysis, LearningPath, SkillQuestion } from "../types";

// Fix: Initialize GoogleGenAI with a named apiKey parameter as required
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// Helper function for JSON responses to avoid repetition and ensure correct model usage
const generateContentWithJson = async (prompt: string, schema: any) => {
    // Fix: Use ai.models.generateContent for querying GenAI with the correct model
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
        },
    });

    try {
        // Fix: Use response.text to directly access the generated text content
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse JSON response:", response.text);
        throw new Error("Invalid JSON response from AI model.");
    }
};

export const analyzeResume = async (resumeText: string, jobRole: string): Promise<CandidateAnalysis & { recommendedAction: string; actionJustification: string; }> => {
    const prompt = `Analyze the following resume for a "${jobRole}" position.
    
    Resume Text:
    ---
    ${resumeText}
    ---

    Based on the resume and job role, provide the following in JSON format:
    1. A concise summary of the candidate's profile.
    2. A list of key skills (maximum 8).
    3. Total years of relevant experience.
    4. A summary of their education.
    5. A "fit score" from 1 to 10, where 10 is a perfect fit for the role.
    6. A recommended next action (e.g., "Request Skill Check", "Shortlist for Interview", "Proceed to final interview", "Reject").
    7. A brief justification for the recommended action.
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            summary: { type: Type.STRING, description: "Concise summary of the candidate's profile." },
            skills: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of key skills (maximum 8)."
            },
            experienceYears: { type: Type.NUMBER, description: "Total years of relevant experience." },
            education: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Summary of their education."
            },
            fitScore: { type: Type.NUMBER, description: "Fit score from 1 to 10." },
            recommendedAction: { type: Type.STRING, description: "Recommended next action for the recruiter." },
            actionJustification: { type: Type.STRING, description: "Brief justification for the recommendation." }
        },
        required: ["summary", "skills", "experienceYears", "education", "fitScore", "recommendedAction", "actionJustification"],
    };

    const result = await generateContentWithJson(prompt, schema);
    
    return result as CandidateAnalysis & { recommendedAction: string; actionJustification: string; };
};


export const generateAnonymizedResume = async (resumeText: string): Promise<string> => {
    const prompt = `Anonymize the following resume text by removing all personally identifiable information (PII) such as name, email, phone number, address, and links to personal profiles (like LinkedIn, GitHub, portfolio). Replace the name with "[Candidate]".

    Original Resume:
    ---
    ${resumeText}
    ---
    
    Return only the anonymized text.
    `;
    // Fix: Use ai.models.generateContent for querying GenAI
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    // Fix: Use response.text to directly access the generated text content
    return response.text;
};

export const generateSkillCheck = async (jobRole: string, skills: string[]): Promise<SkillQuestion[]> => {
    const prompt = `Create a skill check quiz for a "${jobRole}" position, focusing on these skills: ${skills.join(', ')}.
    Generate 5 multiple-choice questions. For each question, provide 4 options and indicate the correct answer's index (0-3).
    `;

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                question: { type: Type.STRING, description: "The question text." },
                options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "An array of 4 possible answers."
                },
                correctAnswerIndex: { type: Type.NUMBER, description: "The 0-based index of the correct answer in the options array." }
            },
            required: ["question", "options", "correctAnswerIndex"]
        }
    };
    
    const result = await generateContentWithJson(prompt, schema);
    return result as SkillQuestion[];
};

export const suggestLearningPath = async (jobRole: string, weakSkills: string[]): Promise<LearningPath[]> => {
    const prompt = `For a candidate applying for a "${jobRole}" role who has shown weakness in the following skills: ${weakSkills.join(', ')}, suggest a learning path.
    For each skill, provide 2-3 learning resources (articles, videos, courses) with a title, a valid URL, and the type of resource.
    `;

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                skill: { type: Type.STRING, description: "The skill to improve." },
                resources: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING, description: "Title of the learning resource." },
                            url: { type: Type.STRING, description: "URL of the resource." },
                            type: { type: Type.STRING, description: "Type of resource (e.g., Article, Video, Course)." }
                        },
                        required: ["title", "url", "type"]
                    },
                    description: "List of learning resources for the skill."
                }
            },
            required: ["skill", "resources"]
        }
    };

    const result = await generateContentWithJson(prompt, schema);
    return result as LearningPath[];
};
