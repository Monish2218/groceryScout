import axiosInstance from './axiosInstance';

interface OrderItem {
    productId: { _id: string; name?: string };
    name: string;
    imageUrl?: string;
    quantity: number;
    pricePerUnit: number;
    unit: string;
    unitQuantity: number;
}
export interface Order {
    _id: string;
    userId: string;
    items: OrderItem[];
    totalAmount: number;
    status: string;
    orderDate: string;
    createdAt: string;
    updatedAt: string;
}

export const fetchOrdersApi = async (): Promise<Order[]> => {
    const response = await axiosInstance.get<Order[]>('/orders');
    return response.data;
};

export const fetchOrderDetailsApi = async (orderId: string): Promise<Order> => {
    if (!orderId) throw new Error("Order ID is required.");
    const response = await axiosInstance.get<Order>(`/orders/${orderId}`);
    return response.data;
};

export const createOrderApi = async (): Promise<Order> => {
    const response = await axiosInstance.post<Order>('/orders');
    return response.data;
};