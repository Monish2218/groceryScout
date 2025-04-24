import axiosInstance from './axiosInstance';

export interface CartItem {
    productId: string;
    name: string;
    imageUrl?: string;
    quantity: number;
    pricePerUnit: number;
    unit: string;
    unitQuantity: number;
}
export interface Cart {
    _id: string;
    userId: string;
    items: CartItem[];
    totalPrice: number;
}

export interface AddItemsPayload {
    items: { productId: string; quantity: number }[];
}

export interface UpdateQuantityPayload {
    quantity: number;
}

export const fetchCartApi = async (): Promise<Cart> => {
    const response = await axiosInstance.get<Cart>('/cart');
    return response.data;
};

export const addItemsToCartApi = async (payload: AddItemsPayload): Promise<Cart> => {
    const response = await axiosInstance.post<Cart>('/cart/items', payload);
    return response.data;
};

export const updateItemQuantityApi = async ({ productId, quantity }: { productId: string; quantity: number }): Promise<Cart> => {
    const payload: UpdateQuantityPayload = { quantity };
    const response = await axiosInstance.put<Cart>(`/cart/items/${productId}`, payload);
    return response.data;
};

export const removeItemApi = async (productId: string): Promise<Cart> => {
    const response = await axiosInstance.delete<Cart>(`/cart/items/${productId}`);
    return response.data;
};

export const clearCartApi = async (): Promise<Cart> => {
    const response = await axiosInstance.delete<Cart>('/cart');
    return response.data;
};