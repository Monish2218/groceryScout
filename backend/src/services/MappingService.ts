import Product, { IProduct } from '../models/Product';
import { ParsedIngredient, MappedItem, UnavailableItem, MappingResult } from '../types/mapping';

/**
 * Attempts to find a product matching the ingredient name/tags.
 * Uses case-insensitive matching.
 * @param normalizedIngredientName - Lowercase, trimmed ingredient name.
 * @returns The matched IProduct or null.
 */
const findMatchingProduct = async (normalizedIngredientName: string): Promise<IProduct | null> => {
    // Strategy 1: Exact match on name (case-insensitive)
    let product = await Product.findOne({
        name: { $regex: `^${normalizedIngredientName}$`, $options: 'i' } // 'i' for case-insensitive, ^$ for exact match
    });

    if (product) return product;

    // Strategy 2: Exact match in tags (case-insensitive)
    product = await Product.findOne({
        tags: { $regex: `^${normalizedIngredientName}$`, $options: 'i' }
    });

     if (product) return product;

    // --- Future Strategy Ideas ---
    // Strategy 3: Fuzzy search on name/tags (requires library like fuse.js integrated here)
    // Strategy 4: Search using the text index (less precise for direct mapping but could be a fallback)
    // const results = await Product.find(
    //     { $text: { $search: normalizedIngredientName } },
    //     { score: { $meta: 'textScore' } }
    // ).sort({ score: { $meta: 'textScore' } }).limit(1);
    // if (results.length > 0) return results[0];
    // --- End Future ---


    return null; // No match found
};

// Add a simple conversion map (adjust values as needed)
const unitConversionFactors = {
    // Weight approximations (can vary by ingredient density!)
    'tsp_g': { default: 3, salt: 6, sugar: 4, spice_powder: 2.5 }, // Approx grams per tsp
    'tbsp_g': { default: 10, butter: 15, sugar: 12, spice_powder: 7 }, // Approx grams per tbsp
    'tbsp_ml': { default: 15 }, // Approx ml per tbsp (for liquids like oil)
    'tsp_ml': { default: 5 },   // Approx ml per tsp

    // Size approximations
    'medium_onion_g': 120,
    'medium_tomato_g': 100,
    // Add more: 'large_onion_g', 'small_clove_garlic_g', etc.
};

/**
 * Calculates the number of product units needed based on recipe quantity.
 * Handles simple unit conversions (g <-> kg, ml <-> l, piece <-> piece).
 * Returns null if conversion is complex or units are incompatible.
 * @param ingredientQuantity - The quantity object from the recipe.
 * @param product - The matched product.
 * @returns The calculated quantity (number of product units) or null.
 */
const calculateProductQuantity = (
    ingredientName: string,
    ingredientQuantity: ParsedIngredient['quantity'],
    product: IProduct
): { quantity: number; notes?: string } | null => {
    let recipeValueStr = ingredientQuantity.value;
    const recipeUnit = ingredientQuantity.unit.toLowerCase();
    const productUnit = product.unit.toLowerCase();
    const productUnitQuantity = product.unitQuantity; // e.g., 200 if unit is 'g' and price is for 200g

    let recipeValue: number = NaN;
    let isApproximate = false; // Flag if we used an approximation
    let requiredBaseAmount: number | null = null; // The amount needed in the product's base unit (g, ml, piece)
    let calculationNotes: string | undefined = undefined;

    // --- Handle Non-numeric Values & Unit Parsing ---
    if (recipeValueStr.includes('to taste')) {
        // Strategy: Add 1 unit of the smallest available product pack.
        // For now, let's just mark as manual check.
         return { quantity: 1, notes: "Recipe specified 'to taste'. Added minimum quantity (1 pack/unit). Please adjust if needed." }; // Return 1 pack/unit? Or null? Let's try returning 1.
        // return null; // Mark as failed calculation
    }

    if (recipeUnit.includes('medium') || recipeUnit.includes('large') || recipeUnit.includes('small')) {
        // Handle size descriptors (e.g., "2 medium onions")
         try {
            recipeValue = parseFloat(recipeValueStr);
            if (isNaN(recipeValue) || recipeValue <= 0) return null;

            let avgWeight = 0;
            const lowerIngredientName = ingredientName.toLowerCase();
            if (lowerIngredientName.includes('onion')) avgWeight = unitConversionFactors.medium_onion_g;
            else if (lowerIngredientName.includes('tomato')) avgWeight = unitConversionFactors.medium_tomato_g;
            // Add other size estimates here

            if (avgWeight > 0 && productUnit === 'kg') {
                requiredBaseAmount = ((recipeValue * avgWeight) / 1000) / productUnitQuantity; // Total grams -> kg -> packs/units
                isApproximate = true;
            } else if (avgWeight > 0 && productUnit === 'g') {
                 requiredBaseAmount = (recipeValue * avgWeight) / productUnitQuantity; // Total grams -> packs/units
                 isApproximate = true;
            }
             else if (avgWeight > 0 && productUnit === 'piece') {
                 requiredBaseAmount = recipeValue / productUnitQuantity; // Directly use the count
                 // isApproximate = false; // This is direct
            }
              else {
                return null;
            }
        } catch (e) { return null; }

    } else if (recipeUnit === 'tbsp' || recipeUnit === 'tsp') {
        // Handle tsp/tbsp
         try {
            recipeValue = parseFloat(recipeValueStr);
            if (isNaN(recipeValue) || recipeValue <= 0) return null;

            let gramsPerUnit = 0;
            let mlPerUnit = 0;

            if (recipeUnit === 'tbsp') {
                 // Prioritize ingredient-specific weight if available
                 if (product.tags.includes('butter') || product.tags.includes('ghee')) gramsPerUnit = unitConversionFactors.tbsp_g.butter;
                 else if (product.tags.includes('sugar')) gramsPerUnit = unitConversionFactors.tbsp_g.sugar;
                 else if (product.tags.includes('spice') || product.tags.includes('powder') || product.tags.includes('masala')) gramsPerUnit = unitConversionFactors.tbsp_g.spice_powder;
                 else gramsPerUnit = unitConversionFactors.tbsp_g.default; // Default weight

                mlPerUnit = unitConversionFactors.tbsp_ml.default; // Volume
            } else { // tsp
                 if (product.tags.includes('salt')) gramsPerUnit = unitConversionFactors.tsp_g.salt;
                 else if (product.tags.includes('sugar')) gramsPerUnit = unitConversionFactors.tsp_g.sugar;
                 else if (product.tags.includes('spice') || product.tags.includes('powder') || product.tags.includes('masala')) gramsPerUnit = unitConversionFactors.tsp_g.spice_powder;
                 else gramsPerUnit = unitConversionFactors.tsp_g.default; // Default weight

                 mlPerUnit = unitConversionFactors.tsp_ml.default; // Volume
            }

            if ((productUnit === 'g' || productUnit === 'kg') && gramsPerUnit > 0) {
                const totalGrams = recipeValue * gramsPerUnit;
                requiredBaseAmount = (productUnit === 'kg') ? (totalGrams / 1000) / productUnitQuantity : totalGrams / productUnitQuantity;
                isApproximate = true;
            } else if ((productUnit === 'ml' || productUnit === 'l') && mlPerUnit > 0) {
                const totalMl = recipeValue * mlPerUnit;
                requiredBaseAmount = (productUnit === 'l') ? (totalMl / 1000) / productUnitQuantity : totalMl / productUnitQuantity;
                 isApproximate = true;
            } else {
                 console.log(`Cannot convert volume unit '${recipeUnit}' to product unit '${productUnit}'`);
                return null; // Cannot convert tsp/tbsp to 'piece' etc.
            }
        } catch (e) { return null; }
    }
    else {
        // Handle standard numeric values (g, kg, ml, l, piece) - Existing logic
        try {
            recipeValue = parseFloat(recipeValueStr);
            if (isNaN(recipeValue) || recipeValue <= 0) return null;

             // --- Conversion Logic ---
             // 1. Piece to Piece
            if (recipeUnit === 'piece' && productUnit === 'piece') {
                requiredBaseAmount = recipeValue;
            }
            // 2. Grams
            else if (recipeUnit === 'g' && productUnit === 'g') {
                requiredBaseAmount = recipeValue / productUnitQuantity;
            } else if (recipeUnit === 'kg' && productUnit === 'g') {
                requiredBaseAmount = (recipeValue * 1000) / productUnitQuantity;
            } else if (recipeUnit === 'g' && productUnit === 'kg') {
                // Need 200g, product sold in 1kg packs. Need 200/1000 = 0.2 packs.
                requiredBaseAmount = (recipeValue / 1000) / productUnitQuantity;
            } else if (recipeUnit === 'kg' && productUnit === 'kg') {
                requiredBaseAmount = recipeValue / productUnitQuantity;
            }
            // 3. Milliliters
            else if (recipeUnit === 'ml' && productUnit === 'ml') {
                requiredBaseAmount = recipeValue / productUnitQuantity;
            } else if (recipeUnit === 'l' && productUnit === 'ml') {
                requiredBaseAmount = (recipeValue * 1000) / productUnitQuantity;
            } else if (recipeUnit === 'ml' && productUnit === 'l') {
                requiredBaseAmount = (recipeValue / 1000) / productUnitQuantity;
            } else if (recipeUnit === 'l' && productUnit === 'l') {
                requiredBaseAmount = recipeValue / productUnitQuantity;
            }
            // X. Complex/Incompatible Units (tsp, tbsp, cup, piece <-> weight/volume etc.)
            else {
                console.log(`Unit mismatch for recipe unit "${recipeUnit}" and product unit "${productUnit}"`);
                return null; // Cannot calculate in v1
            }
        } catch(e) { return null; }
    }


    // --- Rounding and Final Calculation ---
    if (requiredBaseAmount !== null && requiredBaseAmount >= 0) { // Allow 0 initially if calculation results in it
        const roundedQuantity = Math.ceil(requiredBaseAmount);

        // Add notes if approximation or rounding occurred
        if (isApproximate) calculationNotes = `Quantity is approximate based on standard conversions. `;
        if (roundedQuantity > requiredBaseAmount) {
            calculationNotes = (calculationNotes ?? '') + `Rounded up from ${requiredBaseAmount.toFixed(2)}.`;
        } else if (roundedQuantity === 0 && requiredBaseAmount > 0) {
             // If a very small amount is needed, ensure at least 1 unit is bought
             return { quantity: 1, notes: (calculationNotes ?? '') + `Minimum purchase quantity.` };
        } else if (roundedQuantity === 0 && requiredBaseAmount === 0) {
            // If exactly 0 needed (unlikely but possible), maybe return 0 or null? Let's return null.
            return null;
        }


        return { quantity: roundedQuantity, notes: calculationNotes?.trim() };
    }

    console.log(`Calculation failed at the end for ${recipeValueStr} ${recipeUnit} -> ${productUnit}`);
    return null; // Calculation failed
};


/**
 * Takes a list of ingredients from Gemini and maps them to products in the database.
 * @param ingredients - Array of ingredients parsed from Gemini response.
 * @returns A promise resolving to an object with matchedItems and unavailableItems.
 */
export const mapIngredientsToProps = async (ingredients: ParsedIngredient[]): Promise<MappingResult> => {
    const matchedItems: MappedItem[] = [];
    const unavailableItems: UnavailableItem[] = [];

    for (const ingredient of ingredients) {
        const originalQuantityStr = `${ingredient.quantity.value} ${ingredient.quantity.unit}`;
        const normalizedName = ingredient.name.toLowerCase().trim();
         // Basic pluralization removal (can be improved)
        let singularName: string;
        if (normalizedName.endsWith('es')) {
            singularName = normalizedName.slice(0, -2);
        } else if (normalizedName.endsWith('s')) {
            singularName = normalizedName.slice(0, -1);
        } else {
            singularName = normalizedName;
        }

        // Try finding product first with singular, then original normalized name
        let product = await findMatchingProduct(singularName);
        if (!product && singularName !== normalizedName) {
             product = await findMatchingProduct(normalizedName);
        }


        if (!product) {
            unavailableItems.push({
                originalIngredientName: ingredient.name,
                originalQuantity: originalQuantityStr,
                reason: "Product not found in database",
            });
            console.log(`Mapping: Product not found for '${ingredient.name}'`);
            continue; // Move to next ingredient
        }

        // Product found, now attempt quantity calculation
        const calculationResult = calculateProductQuantity(ingredient.name, ingredient.quantity, product);

        if (calculationResult !== null && calculationResult.quantity > 0) {
            // Successfully mapped and calculated quantity
            matchedItems.push({
                originalIngredientName: ingredient.name,
                originalQuantity: originalQuantityStr,
                matchedProduct: product,
                calculatedQuantityNeeded: calculationResult.quantity,
                calculationNotes: calculationResult.notes,
            });
            console.log(`Mapping: Matched '${ingredient.name}' to '${product.name}', Need: ${calculationResult.quantity} unit(s).`);
        } else {
            // Product found, but quantity calculation failed (unit mismatch, parse error, etc.)
            unavailableItems.push({
                originalIngredientName: ingredient.name,
                originalQuantity: originalQuantityStr,
                reason: `Product found ('${product.name}'), but quantity/unit calculation failed (Recipe: ${originalQuantityStr}, Product: ${product.unitQuantity} ${product.unit}). Requires manual check.`,
            });
            console.log(`Mapping: Found '${product.name}' for '${ingredient.name}', but quantity calculation failed.`);
        }
    }

    return { matchedItems, unavailableItems };
};