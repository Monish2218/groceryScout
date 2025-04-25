import { useMutation } from '@tanstack/react-query';
import { toast } from "sonner";
import { processRecipeApi, ProcessRecipePayload, RecipeApiResponse } from '../api/recipeApi'; // Adjust path

export const useProcessRecipe = () => {
    return useMutation<RecipeApiResponse, Error, ProcessRecipePayload>({
        mutationFn: processRecipeApi,
        onSuccess: () => {
            console.log("Recipe processed successfully by API.");
        },
        onError: (error: unknown) => {
            console.error("Error processing recipe:", error);
            const errorResponse = error as { response?: { data?: { message?: string } } };
            toast.error(errorResponse.response?.data?.message ?? "Failed to process recipe.");
        },
    });
};