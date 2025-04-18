import Product, { IProduct } from '../models/Product';
import { ParsedIngredient, MappedItem, UnavailableItem, MappingResult } from '../types/mapping';

/**
 * Attempts to find a product matching the ingredient name/tags.
 * Uses case-insensitive matching.
 * @param normalizedIngredientName - Lowercase, trimmed ingredient name.
 * @returns The matched IProduct or null.
 */
const findMatchingProduct = async (normalizedIngredientName: string): Promise<IProduct | null> => {
    let product = await Product.findOne({
        name: { $regex: `^${normalizedIngredientName}$`, $options: 'i' }
    });
    if (product) return product;

    product = await Product.findOne({
        tags: { $regex: `^${normalizedIngredientName}$`, $options: 'i' }
    });
    if (product) return product;

    return null;
};

const unitConversionFactors = {
    'tsp_g': { default: 3, salt: 6, sugar: 4, spice_powder: 2.5 },
    'tbsp_g': { default: 10, butter: 15, sugar: 12, spice_powder: 7 },
    'tbsp_ml': { default: 15 },
    'tsp_ml': { default: 5 },
    'medium_onion_g': 120,
    'medium_tomato_g': 100,
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
    const productUnitQuantity = product.unitQuantity;

    let isApproximate = false;
    let requiredBaseAmount: number | null = null;

    if (recipeValueStr.includes('to taste')) {
        return handleTasteQuantity();
    }

    if (recipeUnit.includes('medium') || recipeUnit.includes('large') || recipeUnit.includes('small')) {
        try {
            const result = handleSizeDescriptorQuantity(ingredientName, recipeValueStr, productUnit, productUnitQuantity);
            if (result) {
                requiredBaseAmount = result.requiredBaseAmount;
                isApproximate = result.isApproximate;
            } else {
                return null;
            }
        } catch (e) { 
            console.error(`Error in handleSizeDescriptorQuantity:`, e);
            return null; 
        }
    } else if (recipeUnit === 'tbsp' || recipeUnit === 'tsp') {
        try {
            const result = handleTspTbsQuantity(recipeValueStr, recipeUnit, product, productUnit, productUnitQuantity);
            if (result) {
                requiredBaseAmount = result.requiredBaseAmount;
                isApproximate = result.isApproximate;
            } else {
                return null;
            }
        } catch (e) { 
            console.error(`Error in handleTspTbsQuantity:`, e);
            return null; 
        }
    }
    else {
        try {
            const result = handleStandardQuantity(recipeValueStr, recipeUnit, productUnit, productUnitQuantity);
            if (result) {
                requiredBaseAmount = result.requiredBaseAmount;
            } else {
                return null;
            }
        } catch (e) { 
            console.error(`Error in handleStandardQuantity:`, e);
            return null; 
        }
    }

    if (requiredBaseAmount !== null && requiredBaseAmount >= 0) {
        const finalCalculationResult = finalizeQuantityCalculation(requiredBaseAmount, isApproximate);
        if (finalCalculationResult) {
            return finalCalculationResult;
        } else {
            return null;
        }
    }

    console.log(`Calculation failed at the end for ${recipeValueStr} ${recipeUnit} -> ${productUnit}`);
    return null;
};

const handleTasteQuantity = (): { quantity: number; notes?: string } => {
    return { quantity: 1, notes: "Recipe specified 'to taste'. Added minimum quantity (1 pack/unit). Please adjust if needed." };
};

const handleSizeDescriptorQuantity = (
    ingredientName: string,
    recipeValueStr: string,
    productUnit: string,
    productUnitQuantity: number
): { requiredBaseAmount: number; isApproximate: boolean } | null => {
    let recipeValue: number;
    try {
        recipeValue = parseFloat(recipeValueStr);
        if (isNaN(recipeValue) || recipeValue <= 0) return null;

        let avgWeight = 0;
        const lowerIngredientName = ingredientName.toLowerCase();
        if (lowerIngredientName.includes('onion')) avgWeight = unitConversionFactors.medium_onion_g;
        else if (lowerIngredientName.includes('tomato')) avgWeight = unitConversionFactors.medium_tomato_g;

        let requiredBaseAmount: number;
        let isApproximate = false;

        if (avgWeight > 0 && productUnit === 'kg') {
            requiredBaseAmount = ((recipeValue * avgWeight) / 1000) / productUnitQuantity;
            isApproximate = true;
        } else if (avgWeight > 0 && productUnit === 'g') {
            requiredBaseAmount = (recipeValue * avgWeight) / productUnitQuantity;
            isApproximate = true;
        }
        else if (avgWeight > 0 && productUnit === 'piece') {
            requiredBaseAmount = recipeValue / productUnitQuantity;
        }
        else {
            return null;
        }

        return { requiredBaseAmount, isApproximate };
    } catch (e) { 
        console.error(`Error in handleStandardQuantity:`, e);
        return null; 
    }
};

const handleTspTbsQuantity = (
    recipeValueStr: string,
    recipeUnit: string,
    product: IProduct,
    productUnit: string,
    productUnitQuantity: number
): { requiredBaseAmount: number; isApproximate: boolean } | null => {
    let recipeValue: number;
    try {
        recipeValue = parseFloat(recipeValueStr);
        if (isNaN(recipeValue) || recipeValue <= 0) return null;

        let gramsPerUnit = 0;
        let mlPerUnit = 0;

        if (recipeUnit === 'tbsp') {
            if (product.tags.includes('butter') || product.tags.includes('ghee')) gramsPerUnit = unitConversionFactors.tbsp_g.butter;
            else if (product.tags.includes('sugar')) gramsPerUnit = unitConversionFactors.tbsp_g.sugar;
            else if (product.tags.includes('spice') || product.tags.includes('powder') || product.tags.includes('masala')) gramsPerUnit = unitConversionFactors.tbsp_g.spice_powder;
            else gramsPerUnit = unitConversionFactors.tbsp_g.default;

            mlPerUnit = unitConversionFactors.tbsp_ml.default;
        } else {
            if (product.tags.includes('salt')) gramsPerUnit = unitConversionFactors.tsp_g.salt;
            else if (product.tags.includes('sugar')) gramsPerUnit = unitConversionFactors.tsp_g.sugar;
            else if (product.tags.includes('spice') || product.tags.includes('powder') || product.tags.includes('masala')) gramsPerUnit = unitConversionFactors.tsp_g.spice_powder;
            else gramsPerUnit = unitConversionFactors.tsp_g.default;

            mlPerUnit = unitConversionFactors.tsp_ml.default;
        }

        let requiredBaseAmount: number;
        let isApproximate = false;

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
            return null;
        }

        return { requiredBaseAmount, isApproximate };
    } catch (e) { 
        console.error(`Error in handleTspTbsQuantity:`, e);
        return null; 
    }
};

const handleStandardQuantity = (
    recipeValueStr: string,
    recipeUnit: string,
    productUnit: string,
    productUnitQuantity: number
): { requiredBaseAmount: number } | null => {
    let recipeValue: number;
    try {
        recipeValue = parseFloat(recipeValueStr);
        if (isNaN(recipeValue) || recipeValue <= 0) return null;

        let requiredBaseAmount: number;

        if (recipeUnit === 'piece' && productUnit === 'piece') {
            requiredBaseAmount = recipeValue;
        }
        else if (recipeUnit === 'g' && productUnit === 'g') {
            requiredBaseAmount = recipeValue / productUnitQuantity;
        } else if (recipeUnit === 'kg' && productUnit === 'g') {
            requiredBaseAmount = (recipeValue * 1000) / productUnitQuantity;
        } else if (recipeUnit === 'g' && productUnit === 'kg') {
            requiredBaseAmount = (recipeValue / 1000) / productUnitQuantity;
        } else if (recipeUnit === 'kg' && productUnit === 'kg') {
            requiredBaseAmount = recipeValue / productUnitQuantity;
        }
        else if (recipeUnit === 'ml' && productUnit === 'ml') {
            requiredBaseAmount = recipeValue / productUnitQuantity;
        } else if (recipeUnit === 'l' && productUnit === 'ml') {
            requiredBaseAmount = (recipeValue * 1000) / productUnitQuantity;
        } else if (recipeUnit === 'ml' && productUnit === 'l') {
            requiredBaseAmount = (recipeValue / 1000) / productUnitQuantity;
        } else if (recipeUnit === 'l' && productUnit === 'l') {
            requiredBaseAmount = recipeValue / productUnitQuantity;
        }
        else {
            console.log(`Unit mismatch for recipe unit "${recipeUnit}" and product unit "${productUnit}"`);
            return null;
        }

        return { requiredBaseAmount };
    } catch (e) { 
        console.error(`Error in handleStandardQuantity:`, e);
        return null; 
    }
};

const finalizeQuantityCalculation = (
    requiredBaseAmount: number,
    isApproximate: boolean
): { quantity: number; notes?: string } | null => {
    const roundedQuantity = Math.ceil(requiredBaseAmount);
    let calculationNotes: string | undefined = undefined;

    if (isApproximate) calculationNotes = `Quantity is approximate based on standard conversions. `;
    if (roundedQuantity > requiredBaseAmount) {
        calculationNotes = (calculationNotes ?? '') + `Rounded up from ${requiredBaseAmount.toFixed(2)}.`;
    } else if (roundedQuantity === 0 && requiredBaseAmount > 0) {
        return { quantity: 1, notes: (calculationNotes ?? '') + `Minimum purchase quantity.` };
    } else if (roundedQuantity === 0 && requiredBaseAmount === 0) {
        return null;
    }

    return { quantity: roundedQuantity, notes: calculationNotes?.trim() };
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
        let singularName: string;
        if (normalizedName.endsWith('es')) {
            singularName = normalizedName.slice(0, -2);
        } else if (normalizedName.endsWith('s')) {
            singularName = normalizedName.slice(0, -1);
        } else {
            singularName = normalizedName;
        }

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
            continue;
        }

        const calculationResult = calculateProductQuantity(ingredient.name, ingredient.quantity, product);

        if (calculationResult !== null && calculationResult.quantity > 0) {
            matchedItems.push({
                originalIngredientName: ingredient.name,
                originalQuantity: originalQuantityStr,
                matchedProduct: product,
                calculatedQuantityNeeded: calculationResult.quantity,
                calculationNotes: calculationResult.notes,
            });
            console.log(`Mapping: Matched '${ingredient.name}' to '${product.name}', Need: ${calculationResult.quantity} unit(s).`);
        } else {
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