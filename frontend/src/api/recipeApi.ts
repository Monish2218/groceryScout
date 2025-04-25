import axiosInstance from './axiosInstance';

export interface ProcessRecipePayload {
    recipeName: string;
    servings: number;
}

interface Product { _id: string; name: string; price: number; unit: string; unitQuantity: number; imageUrl?: string; }

interface MatchedItemType {
    originalIngredientName: string;
    originalQuantity: string;
    matchedProduct: Product;
    calculatedQuantityNeeded: number;
    calculationNotes?: string;
}

interface UnavailableItemType {
    originalIngredientName: string;
    originalQuantity: string;
    reason: string;
}

export interface RecipeApiResponse {
    recipeName: string;
    servings: number;
    matchedItems: MatchedItemType[];
    unavailableItems: UnavailableItemType[];
    recipeSteps: string[];
}

export const processRecipeApi = async (payload: ProcessRecipePayload): Promise<RecipeApiResponse> => {
    const response = await axiosInstance.post<RecipeApiResponse>('/recipes/process', payload);
    return response.data;
};