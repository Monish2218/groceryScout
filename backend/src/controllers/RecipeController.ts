import { Request, Response } from 'express';
import { generateStructuredContent } from '../services/GeminiService'; // Adjust path
// Import Mapping Service later when ready: import * as MappingService from '../services/MappingService';

// Define the expected structure of an ingredient from Gemini's JSON output
interface GeminiIngredient {
    name: string;
    quantity: {
        value: string;
        unit: string;
    };
}

// Define the expected overall JSON structure from Gemini
interface GeminiRecipeResponse {
    ingredients: GeminiIngredient[];
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
 * Processes a recipe request: calls Gemini (JSON mode), validates response, and eventually maps them.
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

        // 2. Call Gemini Service (expecting parsed JSON directly)
        // The service function now handles the JSON parsing internally
        const jsonResponse: GeminiRecipeResponse = await generateStructuredContent(prompt);

        // 3. Validate the received JSON structure (even though model should adhere)
        let parsedIngredients: GeminiIngredient[] = [];
        let parsedSteps: string[] = [];
        if (jsonResponse && Array.isArray(jsonResponse.ingredients) && Array.isArray(jsonResponse.recipeSteps)) {
             // Basic filtering of potentially malformed items (belt-and-suspenders check)
             parsedIngredients = jsonResponse.ingredients.filter(item =>
               item && typeof item.name === 'string' &&
               item.quantity && typeof item.quantity.value === 'string' && // Check for string value
               typeof item.quantity.unit === 'string'
             );
             // Validate/filter steps (ensure they are strings)
             parsedSteps = jsonResponse.recipeSteps.filter(step => typeof step === 'string' && step.trim().length > 0);
        } else {
             console.error("Received data from Gemini service, but it doesn't match expected structure:", jsonResponse);
             throw new Error('AI service returned data in an unexpected format.');
        }

        // --- TODO: Integrate Mapping Service (Step 7 & 8) ---
        // const mappingResult = await MappingService.mapIngredientsToProps(parsedIngredients);
        // res.status(200).json(mappingResult);
        // ------------------------------------------------------

        // --- For now (Step 6): Return the parsed ingredients AND steps ---
        if (parsedIngredients.length === 0 && jsonResponse.ingredients.length > 0) {
            console.warn("Gemini returned ingredients, but they failed validation:", jsonResponse.ingredients);
            // Still return steps if they are valid, but indicate ingredient issue
            res.status(500).json({ message: "AI returned ingredients in an unexpected format.", ingredients: [], recipeSteps: parsedSteps });
            return;
        } else if (parsedIngredients.length === 0) {
            console.warn("AI processed the recipe but found no valid ingredients.");
             // Still return steps if they are valid
            res.status(200).json({ message: "AI processed the recipe but found no valid ingredients.", ingredients: [], recipeSteps: parsedSteps });
            return;
        }
        // Also check if steps are missing after filtering, if needed
        if (parsedSteps.length === 0 && jsonResponse.recipeSteps.length > 0) {
             console.warn("AI returned steps, but they failed validation/filtering:", jsonResponse.recipeSteps);
             // Return ingredients, but indicate step issue (or handle as needed)
        } else if (parsedSteps.length === 0) {
             console.warn("AI processed the recipe but found no valid steps.");
        }

       // Send back both ingredients and steps
       res.status(200).json({ ingredients: parsedIngredients, recipeSteps: parsedSteps });
       // -------------------------------------------------------------

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