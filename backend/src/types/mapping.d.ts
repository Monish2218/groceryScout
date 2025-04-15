import { IProduct } from "../models/Product"; // Adjust path

// Ingredient structure received from RecipeController (after Gemini processing)
export interface ParsedIngredient {
    name: string;
    quantity: {
        value: string; // Keep as string initially from Gemini
        unit: string;
    };
}

// Structure for items successfully mapped to a product
export interface MappedItem {
    originalIngredientName: string;
    originalQuantity: string; // e.g., "200 g", "1 piece"
    matchedProduct: IProduct; // The full product document found
    calculatedQuantityNeeded: number; // How many units of the product (e.g., 2 packs, 1 kg)
    calculationNotes?: string; // Optional notes like "Rounded up from 1.5"
}

// Structure for items that couldn't be mapped or calculated
export interface UnavailableItem {
    originalIngredientName: string;
    originalQuantity: string;
    reason: string; // e.g., "Product not found", "Unit mismatch (cup to kg)", "Ambiguous unit (pinch)"
    // Optional: suggestedSubstitutes?: IProduct[]; // For v2
}

// Overall result structure from the mapping service
export interface MappingResult {
    matchedItems: MappedItem[];
    unavailableItems: UnavailableItem[];
}