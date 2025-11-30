import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

// Define the response schema for structured output
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    diagnosis: {
      type: Type.STRING,
      enum: ["Pneumonia", "Normal", "Uncertain"],
      description: "The primary diagnosis based on the X-ray analysis.",
    },
    confidence: {
      type: Type.NUMBER,
      description: "Confidence score of the diagnosis from 0 to 100.",
    },
    summary: {
      type: Type.STRING,
      description: "A concise medical summary of the findings explaining 'Why' this diagnosis was made.",
    },
    findings: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of specific radiological observations (e.g., 'Right lower lobe opacity', 'Clear costophrenic angles').",
    },
    heatmap_regions: {
      type: Type.ARRAY,
      description: "Regions of interest that contributed to the diagnosis. If Normal, this can be empty or highlight clear lung fields.",
      items: {
        type: Type.OBJECT,
        properties: {
          y_min: { type: Type.NUMBER, description: "Top coordinate (0-100 percentage)" },
          x_min: { type: Type.NUMBER, description: "Left coordinate (0-100 percentage)" },
          y_max: { type: Type.NUMBER, description: "Bottom coordinate (0-100 percentage)" },
          x_max: { type: Type.NUMBER, description: "Right coordinate (0-100 percentage)" },
          intensity: { type: Type.NUMBER, description: "Importance intensity (0.1 to 1.0)" },
          description: { type: Type.STRING, description: "What this region shows (e.g., 'Consolidation')" },
        },
        required: ["y_min", "x_min", "y_max", "x_max", "intensity", "description"],
      },
    },
  },
  required: ["diagnosis", "confidence", "summary", "findings", "heatmap_regions"],
};

export const analyzeXRayImage = async (base64Image: string): Promise<AnalysisResult> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key not found");
    }

    const ai = new GoogleGenAI({ apiKey });

    // Use fast multimodal model for analysis
    const modelId = "gemini-2.5-flash";

    const prompt = `
      You are an expert radiologist and Explainable AI (XAI) system. 
      Analyze this chest X-ray image for signs of Pneumonia versus Normal lungs.
      
      Your goal is not just to classify, but to explain WHY.
      1. Identify if the image shows 'Pneumonia' or is 'Normal'.
      2. Provide a confidence score.
      3. List key findings.
      4. Crucially, identify specific rectangular regions (0-100 percentage coordinates) on the image that support your decision. 
         - If Pneumonia: Highlight areas of opacity, consolidation, or infiltration.
         - If Normal: Highlight the clear lung fields or costophrenic angles that indicate health.
    `;

    // Remove the data:image/png;base64, prefix if present
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/png", data: cleanBase64 } },
          { text: prompt }
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.2, // Low temperature for more deterministic medical analysis
      },
    });

    const textResponse = response.text;
    if (!textResponse) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(textResponse) as AnalysisResult;
    return result;

  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
};