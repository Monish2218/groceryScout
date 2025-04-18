import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    throw new Error('FATAL ERROR: GEMINI_API_KEY is not defined.');
}

const ai = new GoogleGenAI({apiKey: API_KEY});
const MODEL_NAME = "gemini-2.0-flash";
const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    ingredients: {
      type: Type.ARRAY,
      description: "List of ingredients with quantities.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: "Name of the ingredient (e.g., All-Purpose Flour, Red Onion)",
          },
          quantity: {
            type: Type.OBJECT,
            description: "Quantity required.",
            properties: {
              value: {
                type: Type.STRING,
                description: "Amount of the ingredient (e.g., '200', '1', '0.5', 'a pinch'). Represent numbers as strings.",
              },
              unit: {
                type: Type.STRING,
                description: "Unit of measurement (e.g., 'g', 'ml', 'kg', 'l', 'piece', 'tsp', 'tbsp', 'pinch', 'dash')",
              },
            },
            required: ["value", "unit"],
          },
        },
        required: ["name", "quantity"],
      },
    },
    recipeSteps: {
      type: Type.ARRAY,
      description: "Step-by-step instructions to prepare the recipe.",
      items: {
        type: Type.STRING,
        description: "A single step in the recipe instructions.",
      }
    }
  },
  required: ["ingredients", "recipeSteps"],
};

/**
 * Generates content using the configured Gemini model.
 * Handles basic error checking and extracts text response.
 * @param prompt - The text prompt to send to the model.
 * @returns The generated text content as a string.
 * @throws Error if API call fails or response is blocked/empty.
 */
export const generateStructuredContent = async (prompt: string): Promise<any> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        candidateCount: 1,
        temperature: 0.3,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        safetySettings: safetySettings,
      }
    });

    console.log("Response from Gemini: ", response.text);
    if (response.candidates && response.candidates.length > 0) {
      console.log("Finish reason:", response.candidates[0].finishReason);
      console.log("Safety ratings:", response.candidates[0].safetyRatings);
    }

    if (!response) {
      throw new Error('Gemini API call failed: No response received.');
    }
    if (response.promptFeedback?.blockReason) {
      throw new Error(`Gemini API call blocked: ${response.promptFeedback.blockReason}`);
    }

    const jsonText = response.text;
    if (!jsonText) {
      console.error("Gemini response finished OK but returned empty text in JSON mode. Check API response structure.", response);
      throw new Error('Gemini API call failed: Empty JSON response text.');
    }
    console.log("Received JSON text length from Gemini:", jsonText.length);

    try {
      const parsedJson = JSON.parse(jsonText);
      if (!parsedJson.ingredients || !parsedJson.recipeSteps) {
        console.error("Parsed JSON missing required fields (ingredients or recipeSteps):", parsedJson);
        throw new Error("AI response JSON missing required fields.");
      }
      return parsedJson;
    } catch (parseError) {
      console.error("Error parsing JSON response from Gemini:", parseError);
      console.error("Raw JSON text was:", jsonText);
      throw new Error(`Failed to parse JSON response from AI. ${parseError instanceof Error ? parseError.message : ''}`);
    }
  } catch (error: unknown) {
    console.error("Error calling Gemini API (JSON Mode):", error);
    if (error instanceof Error) {
      throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error('An unknown error occurred while calling the Gemini API.');
  }
};