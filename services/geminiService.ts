
import { GoogleGenAI, Type } from "@google/genai";
import { Subject, Mark } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface AnalysisResponse {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export interface CareerGuidance {
  trajectories: {
    title: string;
    description: string;
    recommendedSubjects: string[];
    potentialRoles: string[];
  }[];
  overallPotential: string;
}

export const analyzeStudentResult = async (
  studentName: string,
  marks: Mark[],
  subjects: Subject[]
): Promise<AnalysisResponse> => {
  const resultData = marks.map(m => {
    const sub = subjects.find(s => s.id === m.subjectId);
    return `${sub?.name}: ${m.total}/${sub?.maxMarks} (Grade: ${m.grade})`;
  }).join(", ");

  const prompt = `
    Analyze the academic performance for student: ${studentName}.
    Subject marks: ${resultData}.
    Provide a professional academic summary, identify core strengths and weaknesses, and give actionable suggestions for improvement.
    Format your response as a JSON object with keys: summary, strengths (array), weaknesses (array), suggestions (array).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["summary", "strengths", "weaknesses", "suggestions"],
        },
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return {
      summary: "AI analysis is currently unavailable.",
      strengths: ["Consistency"],
      weaknesses: ["Connection issues"],
      suggestions: ["Consult with a teacher for detailed feedback."]
    };
  }
};

export const getCareerGuidance = async (
  studentName: string,
  marks: Mark[],
  subjects: Subject[]
): Promise<CareerGuidance> => {
  const resultData = marks.map(m => {
    const sub = subjects.find(s => s.id === m.subjectId);
    return `${sub?.name}: ${m.total}/${sub?.maxMarks}`;
  }).join(", ");

  const prompt = `
    As an expert academic advisor, analyze ${studentName}'s results: ${resultData}.
    Identify subject clusters (e.g., STEM, Humanities, Creative) where they excel.
    Suggest 3 career trajectories.
    Return JSON with keys: "overallPotential" (string) and "trajectories" (array of objects with "title", "description", "recommendedSubjects", "potentialRoles").
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallPotential: { type: Type.STRING },
            trajectories: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  recommendedSubjects: { type: Type.ARRAY, items: { type: Type.STRING } },
                  potentialRoles: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["title", "description", "recommendedSubjects", "potentialRoles"],
              }
            }
          },
          required: ["overallPotential", "trajectories"],
        },
      },
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Career AI failed:", error);
    throw error;
  }
};
