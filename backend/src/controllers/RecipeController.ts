import { Request, Response } from 'express';
import { generateStructuredContent } from '../services/GeminiService'; // Adjust path
import * as MappingService from '../services/MappingService'; // Import Mapping Service
import { ParsedIngredient, MappingResult } from '../types/mapping'; // Import types

// Define the expected overall JSON structure from Gemini
interface GeminiRecipeResponse {
    ingredients: ParsedIngredient[];
    recipeSteps: string[];
}

/**
 * Constructs the prompt for Gemini to extract ingredients and steps.
 */
const buildGeminiPrompt = (recipeName: string, servings: number): string => {
    const prompt = `
Analyze the recipe "${recipeName}" for ${servings} servings.

Your tasks are:
1.  Extract the list of ingredients and their required quantities. Use standard metric units (g, ml, kg, l) or common units (piece, tsp, tbsp, pinch, dash) where appropriate. Represent all quantity values as strings (e.g., "200", "1", "0.5", "a pinch").
2.  Provide clear, concise, step-by-step cooking instructions for the recipe.

Generate ONLY a JSON object that strictly adheres to the schema provided in the API call's generation configuration. The JSON object must contain:
- An "ingredients" array: Each element is an object with "name" (string) and "quantity" (object with string "value" and string "unit").
- A "recipeSteps" array: Each element is a string representing a single cooking step.

Example structure expected (though content will vary):
{
  "ingredients": [
    { "name": "...", "quantity": { "value": "...", "unit": "..." } }
  ],
  "recipeSteps": [
    "Step 1: Do something.",
    "Step 2: Do something else.",
    "Step 3: Continue until done."
  ]
}

Now, provide the JSON output for "${recipeName}" for ${servings} servings.
    `;
    
    return prompt.trim(); 
};

/**
 * Processes a recipe request: calls Gemini, maps ingredients, returns combined result.
 */
export const processRecipe = async (req: Request, res: Response): Promise<void> => {
    const { recipeName, servings } = req.body;

    // Basic validation
    if (!recipeName || !servings) {
        res.status(400).json({ message: 'Please provide recipeName and servings' });
        return;
    }
    const numServings = parseInt(servings, 10);
    if (isNaN(numServings) || numServings <= 0) {
         res.status(400).json({ message: 'Servings must be a positive number' });
        return;
    }

    try {
        // 1. Build the prompt
        const prompt = buildGeminiPrompt(recipeName, numServings);

        // 2. Call Gemini Service
        const jsonResponse: GeminiRecipeResponse = await generateStructuredContent(prompt);

        // 3. Validate the received JSON structure
        let parsedIngredients: ParsedIngredient[] = [];
        let parsedSteps: string[] = [];
        if (jsonResponse && Array.isArray(jsonResponse.ingredients) && Array.isArray(jsonResponse.recipeSteps)) {
             // Validate/filter ingredients
             parsedIngredients = jsonResponse.ingredients.filter(item =>
               item && typeof item.name === 'string' &&
               item.quantity && typeof item.quantity.value === 'string' &&
               typeof item.quantity.unit === 'string'
             );
             // Validate/filter steps
             parsedSteps = jsonResponse.recipeSteps.filter(step => typeof step === 'string' && step.trim().length > 0);
        } else {
             console.error("Received data from Gemini service, but it doesn't match expected structure:", jsonResponse);
             throw new Error('AI service returned data in an unexpected format.');
        }

        // 4. Call Mapping Service
        console.log(`Mapping ${parsedIngredients.length} ingredients...`);
        const mappingResult: MappingResult = await MappingService.mapIngredientsToProps(parsedIngredients);
        console.log(`Mapping complete: ${mappingResult.matchedItems.length} matched, ${mappingResult.unavailableItems.length} unavailable.`);

        // 5. Combine results and send response
        const finalResponse = {
            recipeName: recipeName, // Include original request info for context
            servings: numServings,
            ...mappingResult, // Includes matchedItems and unavailableItems
            recipeSteps: parsedSteps
        };

        res.status(200).json(finalResponse);
        // ---------------------------------------------------------
    } catch (error: unknown) {
        console.error('Recipe Processing Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        // Distinguish between Gemini API errors and parsing errors if needed
        if (errorMessage.startsWith('Gemini API Error:') || errorMessage.startsWith('Gemini generation finished unexpectedly') || errorMessage.startsWith('Gemini prompt blocked') || errorMessage.startsWith('Gemini API call failed')) {
            res.status(502).json({ message: 'Error communicating with the AI service.', error: errorMessage });
        } else if (errorMessage.startsWith('Failed to parse JSON response') || errorMessage.startsWith('AI service returned data') || errorMessage.includes('missing required fields')) {
           res.status(500).json({ message: 'Failed to understand the structure of the AI response.', error: errorMessage });
       }
        else {
            res.status(500).json({ message: 'Server error processing recipe', error: errorMessage });
        }
    }
};