import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner";
import {
    fetchOrdersApi,
    fetchOrderDetailsApi,
    createOrderApi,
    type Order,
} from '@/api/ordersApi';
import { queryKeys } from './keys';
import { useAuth } from '@/context/AuthContext';

export const useFetchOrders = () => {
    const { isAuthenticated } = useAuth();
    return useQuery<Order[], Error>({
        queryKey: queryKeys.orders,
        queryFn: fetchOrdersApi,
        enabled: !!isAuthenticated,
        staleTime: 1000 * 60 * 5,
    });
};

export const useFetchOrderDetails = (orderId: string | undefined) => {
    const { isAuthenticated } = useAuth();
    return useQuery<Order, Error>({
        queryKey: queryKeys.order(orderId),
        queryFn: () => {
            if(!orderId) throw new Error("No Order ID provided");
            return fetchOrderDetailsApi(orderId)
        },
        enabled: !!isAuthenticated && !!orderId,
        staleTime: 1000 * 60 * 10,
    });
};

export const useCreateOrder = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    return useMutation({
        mutationFn: createOrderApi,
        onSuccess: (createdOrder) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.orders });
            queryClient.invalidateQueries({ queryKey: queryKeys.cart });
            queryClient.setQueryData(queryKeys.order(createdOrder._id), createdOrder);
            toast.success(`Order placed! ID: #${createdOrder._id.substring(createdOrder._id.length - 6)}`);
            navigate('/orders');
        },
        onError: (error: unknown) => {
            console.error("Error creating order:", error);
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message ?? "Failed to place order.");
        }
    });
};