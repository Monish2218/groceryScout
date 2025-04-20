// src/context/CartContext.tsx
import React, {
    createContext,
    useState,
    useEffect,
    useContext,
    ReactNode,
    useCallback,
} from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from './AuthContext'; // To check if user is logged in

// Define the structure of a cart item (matching backend CartItem schema)
export interface CartItem {
    productId: string, // Populate product ID at least
    name: string;
    imageUrl?: string;
    quantity: number;
    pricePerUnit: number;
    unit: string;
    unitQuantity: number;
    // Note: Backend might send productId as just string or full object depending on population
    // Adjust this interface based on your GET /api/cart response structure
}

// Define the shape of the Cart state from backend (matching ICart)
interface Cart {
    _id: string;
    userId: string;
    items: CartItem[];
    totalPrice: number;
    // Add createdAt, updatedAt if needed
}


// Define the shape of the context state & actions
interface CartContextType {
    cart: Cart | null; // Holds the full cart object
    itemCount: number; // Just the total number of individual items
    isLoadingCart: boolean;
    cartError: string | null;
    fetchCart: () => Promise<void>;
    addToCart: (productId: string, quantity: number) => Promise<boolean>; // Returns success status
    updateItemQuantity: (productId: string, newQuantity: number) => Promise<boolean>;
    removeItem: (productId: string) => Promise<boolean>;
    clearCart: () => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
    children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    const { isAuthenticated } = useAuth(); // Get auth status
    const [cart, setCart] = useState<Cart | null>(null);
    const [itemCount, setItemCount] = useState<number>(0);
    const [isLoadingCart, setIsLoadingCart] = useState<boolean>(false);
    const [cartError, setCartError] = useState<string | null>(null);

    // Function to fetch the user's cart
    const fetchCart = useCallback(async () => {
        if (!isAuthenticated) {
            setCart(null); // Clear cart if not logged in
            setItemCount(0);
            return; // Don't fetch if not logged in
        }
        // console.log("Fetching cart...");
        setIsLoadingCart(true);
        setCartError(null);
        try {
            const response = await axiosInstance.get<Cart>('/cart'); // Expect Cart type
            setCart(response.data);
            // Calculate item count (sum of quantities)
             const count = response.data.items.reduce((sum, item) => sum + item.quantity, 0);
             setItemCount(count);
             // console.log("Cart fetched:", response.data, "Item count:", count);

        } catch (err: unknown) {
            console.error("Failed to fetch cart:", err);
            const error = err as { response?: { data?: { message?: string } } };
            setCartError(error.response?.data?.message ?? "Could not load cart.");
            setCart(null); // Clear cart on error
            setItemCount(0);
        } finally {
            setIsLoadingCart(false);
        }
    }, [isAuthenticated]); // Dependency on isAuthenticated

    // Fetch cart initially when auth status changes or on mount if authenticated
    useEffect(() => {
        fetchCart();
    }, [fetchCart, isAuthenticated]); // Runs when fetchCart or isAuthenticated changes


    // Function to add item(s) to the cart
    const addToCart = async (productId: string, quantity: number): Promise<boolean> => {
        if (!isAuthenticated) {
            setCartError("Please log in to add items to your cart.");
            return false;
        }
        // Consider adding a specific loading state for this action if needed
        // setIsLoadingCart(true); // Or a different state like isAddingItem
        setCartError(null);
        try {
            const payload = {
                items: [{ productId, quantity }]
            };
            // Call the backend API that adds items
            await axiosInstance.post('/cart/items', payload);

            // Refresh the cart state after successfully adding
            await fetchCart();
            return true; // Indicate success
        } catch (err: unknown) {
            console.error("Failed to add item to cart:", err);
            const error = err as { response?: { data?: { message?: string } } };
            setCartError(error.response?.data?.message ?? "Could not add item to cart.");
            return false; // Indicate failure
        } finally {
            // setIsLoadingCart(false); // Reset loading state
        }
    };

    // --- NEW: updateItemQuantity function ---
    const updateItemQuantity = async (productId: string, newQuantity: number): Promise<boolean> => {
        if (!isAuthenticated || newQuantity <= 0) return false;
        // setIsUpdatingItemId(productId); // Set specific loading state
        setCartError(null);
        try {
            const payload = { quantity: newQuantity };
            await axiosInstance.put(`/cart/items/${productId}`, payload);
            await fetchCart(); // Refresh cart state
            return true;
        } catch (err: unknown) {
            console.error("Failed to update item quantity:", err);
            const error = err as { response?: { data?: { message?: string } } };
            setCartError(error.response?.data?.message ?? "Could not update item quantity.");
            return false;
        } finally {
            // setIsUpdatingItemId(null); // Clear specific loading state
        }
    };

    // --- NEW: removeItem function ---
    const removeItem = async (productId: string): Promise<boolean> => {
        if (!isAuthenticated) return false;
       // setIsRemovingItemId(productId); // Set specific loading state
        setCartError(null);
        try {
            await axiosInstance.delete(`/cart/items/${productId}`);
            await fetchCart(); // Refresh cart state
            return true;
        } catch (err: unknown) {
            console.error("Failed to remove item:", err);
            const error = err as { response?: { data?: { message?: string } } };
            setCartError(error.response?.data?.message ?? "Could not remove item from cart.");
            return false;
        } finally {
            // setIsRemovingItemId(null); // Clear specific loading state
        }
    };

    // --- NEW: clearCart function ---
    const clearCart = async (): Promise<boolean> => {
        if (!isAuthenticated) return false;
        setIsLoadingCart(true); // Use general loading state for this
        setCartError(null);
        try {
            await axiosInstance.delete('/cart');
            await fetchCart(); // Refresh cart state (should be empty)
            return true;
        } catch (err: unknown) {
            console.error("Failed to clear cart:", err);
            const error = err as { response?: { data?: { message?: string } } };
            setCartError(error.response?.data?.message ?? "Could not clear cart.");
            return false;
        } finally {
            setIsLoadingCart(false);
        }
    };


    const value: CartContextType = {
        cart,
        itemCount,
        isLoadingCart,
        cartError,
        fetchCart,
        addToCart,
        updateItemQuantity,
        removeItem,
        clearCart,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to consume the Cart Context
export const useCart = (): CartContextType => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};