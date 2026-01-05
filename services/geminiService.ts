
import { GoogleGenAI, Type } from "@google/genai";
import { Sentiment } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeCivicReport = async (text: string, imageData?: string) => {
  const model = "gemini-3-pro-preview";
  
  const promptText = `
    You are an expert urban intelligence analyst. Analyze this civic report.
    User Input: "${text || "No text provided."}"
    
    ${imageData ? "PRIORITY: A photo is provided. Carefully inspect the photo. Use the visual evidence as the primary source for the Title, Description, and Category. If the text and photo disagree, trust the photo." : "Use the text provided for analysis."}
    
    Tasks:
    1. Title: Create a professional, concise title (3-5 words) based primarily on visual evidence if available.
    2. Description: Provide a detailed, clear description of the urban issue observed. Use simple English but be specific.
    3. Category: Select the most appropriate category: Roads & Infrastructure, Water Supply, Sanitation & Waste, Electricity, Public Safety, Environment, Transportation, Public Parks, Healthcare, or Other.
    4. Department: Suggest the relevant municipal department.
    5. Sentiment: Determine the public sentiment (positive, neutral, negative).
    6. Summary: A 1-sentence analytical summary for a governance dashboard.
    7. Priority: Low, Medium, or High (based on safety risk).
  `;

  const contents: any[] = [{ text: promptText }];
  
  if (imageData) {
    const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;
    let mimeType = "image/jpeg";
    const mimeMatch = imageData.match(/^data:(image\/[a-zA-Z+]+);base64,/);
    if (mimeMatch) mimeType = mimeMatch[1];

    contents.push({
      inlineData: {
        mimeType: mimeType,
        data: base64Data
      }
    });
  }

  const response = await ai.models.generateContent({
    model,
    contents: { parts: contents },
    config: {
      thinkingConfig: { thinkingBudget: 4000 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          category: { type: Type.STRING },
          department: { type: Type.STRING },
          sentiment: { type: Type.STRING },
          summary: { type: Type.STRING },
          priority: { type: Type.STRING }
        },
        required: ["title", "description", "category", "department", "sentiment", "summary", "priority"]
      }
    }
  });

  try {
    const resultText = response.text;
    if (!resultText) throw new Error("Empty AI response");
    return JSON.parse(resultText);
  } catch (e) {
    console.error("AI Analysis failed:", e);
    return {
      title: "Identified Urban Issue",
      description: "An issue has been flagged and requires manual verification.",
      category: "Other",
      department: "General City Services",
      sentiment: Sentiment.NEUTRAL,
      summary: "AI analysis encountered an error. Human review required.",
      priority: "Medium"
    };
  }
};

export const generateUrbanPulseSummary = async (reports: any[]) => {
  const model = "gemini-3-flash-preview";
  const reportData = reports.slice(0, 10).map(r => `${r.category} (${r.status}): ${r.sentiment}`).join(', ');
  
  const response = await ai.models.generateContent({
    model,
    contents: `Urban Data Stream: ${reportData}. Synthesize a high-level, 1-sentence urban health summary.`,
  });

  return response.text;
};
