import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    fetchCartApi,
    addItemsToCartApi,
    updateItemQuantityApi,
    removeItemApi,
    clearCartApi
} from '../api/cartApi';
import { queryKeys } from './keys';

export const useFetchCart = () => {
    return useQuery({
        queryKey: queryKeys.cart,
        queryFn: fetchCartApi,
    });
};

export const useAddToCart = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addItemsToCartApi,
        onSuccess: (updatedCart) => {
            queryClient.setQueryData(queryKeys.cart, updatedCart);
            console.log("Item(s) added successfully via RQ mutation.");
            // TODO: Trigger success toast
        },
        onError: (error: unknown) => {
            console.error("Error adding item(s) to cart via RQ mutation:", error);
            // TODO: Trigger error toast
       }
    });
};

export const useUpdateCartItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateItemQuantityApi,
        onSuccess: (updatedCart, variables) => {
            queryClient.setQueryData(queryKeys.cart, updatedCart);
            console.log(`Item ${variables.productId} quantity updated.`);
        },
        onError: (error: unknown, variables) => {
            console.error(`Error updating quantity for item ${variables.productId}:`, error);
            queryClient.invalidateQueries({ queryKey: queryKeys.cart });
            // TODO: Trigger error toast
        }
    });
};

export const useRemoveCartItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: removeItemApi,
        onSuccess: (updatedCart, productIdToRemove) => {
            queryClient.setQueryData(queryKeys.cart, updatedCart);
            console.log(`Item ${productIdToRemove} removed successfully.`);
            // TODO: Trigger success toast
        },
        onError: (error: unknown, productIdToRemove) => {
            console.error(`Error removing item ${productIdToRemove}:`, error);
            // TODO: Trigger error toast
        }
    });
};

export const useClearCart = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: clearCartApi,
        onSuccess: (updatedCart) => {
            queryClient.setQueryData(queryKeys.cart, updatedCart);
            console.log("Cart cleared successfully.");
            // TODO: Trigger success toast
        },
        onError: (error: unknown) => {
            console.error("Error clearing cart:", error);
            // TODO: Trigger error toast
        }
    });
};