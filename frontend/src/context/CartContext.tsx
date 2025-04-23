import React, {
    createContext,
    useState,
    useEffect,
    useContext,
    ReactNode,
    useCallback,
} from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from './AuthContext';

export interface CartItem {
    productId: string,
    name: string;
    imageUrl?: string;
    quantity: number;
    pricePerUnit: number;
    unit: string;
    unitQuantity: number;
}

interface Cart {
    _id: string;
    userId: string;
    items: CartItem[];
    totalPrice: number;
}

interface CartContextType {
    cart: Cart | null;
    itemCount: number;
    isLoadingCart: boolean;
    cartError: string | null;
    fetchCart: () => Promise<void>;
    addToCart: (productId: string, quantity: number) => Promise<boolean>;
    updateItemQuantity: (productId: string, newQuantity: number) => Promise<boolean>;
    removeItem: (productId: string) => Promise<boolean>;
    clearCart: () => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
    children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [cart, setCart] = useState<Cart | null>(null);
    const [itemCount, setItemCount] = useState<number>(0);
    const [isLoadingCart, setIsLoadingCart] = useState<boolean>(false);
    const [cartError, setCartError] = useState<string | null>(null);

    const fetchCart = useCallback(async () => {
        if (!isAuthenticated) {
            setCart(null);
            setItemCount(0);
            return;
        }
        setIsLoadingCart(true);
        setCartError(null);
        try {
            const response = await axiosInstance.get<Cart>('/cart');
            setCart(response.data);
            const count = response.data.items.reduce((sum, item) => sum + item.quantity, 0);
            setItemCount(count);
        } catch (err: unknown) {
            console.error("Failed to fetch cart:", err);
            const error = err as { response?: { data?: { message?: string } } };
            setCartError(error.response?.data?.message ?? "Could not load cart.");
            setCart(null);
            setItemCount(0);
        } finally {
            setIsLoadingCart(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart, isAuthenticated]);

    const addToCart = useCallback(async (productId: string, quantity: number): Promise<boolean> => {
        if (!isAuthenticated) {
            setCartError("Please log in to add items to your cart.");
            return false;
        }
        setCartError(null);
        try {
            const payload = {
                items: [{ productId, quantity }]
            };
            await axiosInstance.post('/cart/items', payload);
            await fetchCart();
            return true;
        } catch (err: unknown) {
            console.error("Failed to add item to cart:", err);
            const error = err as { response?: { data?: { message?: string } } };
            setCartError(error.response?.data?.message ?? "Could not add item to cart.");
            return false;
        }
    }, [isAuthenticated, fetchCart]);

    const updateItemQuantity = useCallback(async (productId: string, newQuantity: number): Promise<boolean> => {
        if (!isAuthenticated || newQuantity <= 0) return false;
        setCartError(null);
        try {
            const payload = { quantity: newQuantity };
            await axiosInstance.put(`/cart/items/${productId}`, payload);
            await fetchCart();
            return true;
        } catch (err: unknown) {
            console.error("Failed to update item quantity:", err);
            const error = err as { response?: { data?: { message?: string } } };
            setCartError(error.response?.data?.message ?? "Could not update item quantity.");
            return false;
        }
    }, [isAuthenticated, fetchCart]);

    const removeItem = useCallback(async (productId: string): Promise<boolean> => {
        if (!isAuthenticated) return false;
        setCartError(null);
        try {
            await axiosInstance.delete(`/cart/items/${productId}`);
            await fetchCart();
            return true;
        } catch (err: unknown) {
            console.error("Failed to remove item:", err);
            const error = err as { response?: { data?: { message?: string } } };
            setCartError(error.response?.data?.message ?? "Could not remove item from cart.");
            return false;
        }
    }, [isAuthenticated, fetchCart]);

    const clearCart = useCallback(async (): Promise<boolean> => {
        if (!isAuthenticated) return false;
        setIsLoadingCart(true);
        setCartError(null);
        try {
            await axiosInstance.delete('/cart');
            await fetchCart();
            return true;
        } catch (err: unknown) {
            console.error("Failed to clear cart:", err);
            const error = err as { response?: { data?: { message?: string } } };
            setCartError(error.response?.data?.message ?? "Could not clear cart.");
            return false;
        } finally {
            setIsLoadingCart(false);
        }
    }, [isAuthenticated, fetchCart]);


    const value = React.useMemo<CartContextType>(() => ({
        cart,
        itemCount,
        isLoadingCart,
        cartError,
        fetchCart,
        addToCart,
        updateItemQuantity,
        removeItem,
        clearCart,
    }), [cart, itemCount, isLoadingCart, cartError, fetchCart, addToCart, updateItemQuantity, removeItem, clearCart]);

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};