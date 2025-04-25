import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    fetchCartApi,
    addItemsToCartApi,
    updateItemQuantityApi,
    removeItemApi,
    clearCartApi,
    type Cart,
} from '../api/cartApi';
import { queryKeys } from './keys';
import { toast } from "sonner";

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
            queryClient.setQueryData<Cart | undefined>(queryKeys.cart, updatedCart);
            toast.success("Item(s) added to cart!");
        },
        onError: (error: unknown) => {
            console.error("Error adding item(s) to cart via RQ mutation:", error);
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message ?? "Failed to add item(s).");
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
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message ?? "Failed to update quantity.");
            queryClient.invalidateQueries({ queryKey: queryKeys.cart });
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
            toast.success("Item removed from cart.");
        },
        onError: (error: unknown, productIdToRemove) => {
            console.error(`Error removing item ${productIdToRemove}:`, error);
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message ?? "Failed to remove item.");
        }
    });
};

export const useClearCart = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: clearCartApi,
        onSuccess: (updatedCart) => {
            queryClient.setQueryData(queryKeys.cart, updatedCart);
            toast.success("Cart cleared.");
        },
        onError: (error: unknown) => {
            console.error("Error clearing cart:", error);
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message ?? "Failed to clear cart.");
        }
    });
};