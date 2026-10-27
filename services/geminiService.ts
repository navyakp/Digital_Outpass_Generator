import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult } from "../types";

const apiKey = (process.env.API_KEY && process.env.API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') ? process.env.API_KEY : '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeOutpassReason = async (
  reason: string,
  destination: string,
  durationHours: number
): Promise<AIAnalysisResult> => {
  if (!apiKey) {
    console.warn("No API Key provided. Returning mock analysis.");
    return {
      category: "General",
      urgencyLevel: "Low",
      riskAssessment: "API Key missing, cannot analyze.",
      recommendedAction: "Review"
    };
  }

  try {
    const prompt = `
      Analyze this outpass request for a university student.
      Reason: "${reason}"
      Destination: "${destination}"
      Duration: ${durationHours} hours.

      Assess the urgency, categorize the reason (e.g., Medical, Academic, Personal, Leisure, Emergency), 
      provide a short risk assessment (1 sentence), and a recommended action for the warden.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            urgencyLevel: { type: Type.STRING, enum: ["Low", "Medium", "High", "Critical"] },
            riskAssessment: { type: Type.STRING },
            recommendedAction: { type: Type.STRING, enum: ["Approve", "Review", "Reject"] }
          },
          required: ["category", "urgencyLevel", "riskAssessment", "recommendedAction"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as AIAnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return {
      category: "Unknown",
      urgencyLevel: "Medium",
      riskAssessment: "AI analysis failed. Please review manually.",
      recommendedAction: "Review"
    };
  }
};

export const simulateParentCall = async (
  studentName: string,
  destination: string,
  reason: string,
  parentMobile: string
): Promise<{ approved: boolean; transcript: string }> => {
  if (!apiKey) {
    // Return offline message instead of fallback simulation
    return {
      approved: false,
      transcript: `[SYSTEM OFFLINE]: AI Voice Gateway is currently unavailable (API key not configured).\n\nPlease use "Manual Verify Parent" option to proceed with parent verification via phone or in-person contact.`
    };
  }

  try {
    const prompt = `
      Simulate a short phone conversation transcript between an AI Voice Agent and a Parent regarding a student outpass request.
      Student: ${studentName}
      Destination: ${destination}
      Reason: ${reason}
      
      The AI should ask for confirmation.
      The Parent should respond (Simulate a realistic response, either approving or rejecting randomly, but 80% chance of approval).
      
      Return a JSON object with:
      1. 'approved': boolean (true if parent said yes, false if no)
      2. 'transcript': string (The dialogue script formatted with [AI] and [PARENT])
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            approved: { type: Type.BOOLEAN },
            transcript: { type: Type.STRING }
          },
          required: ["approved", "transcript"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text);
  } catch (error) {
    console.error("AI Call Simulation Failed", error);
    return {
      approved: false,
      transcript: "Error: Could not connect to AI Voice Gateway."
    };
  }
};

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  try {
    const prompt = `Translate the following text to ${targetLanguage}. Return ONLY the translated text, nothing else.
    
    Text: "${text}"`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const translatedText = response.text;
    return translatedText ? translatedText.trim() : text;
  } catch (error) {
    console.error("Translation Error:", error);
    return text; // Fallback to original text
  }
};