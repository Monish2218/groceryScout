import { useState } from 'react';
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CartItem } from "../components/CartItem"
import { CartSummary } from "../components/CartSummary"
import { useCart } from "@/context/CartContext"
import { Link, useNavigate } from "react-router-dom"
import axiosInstance from '../api/axiosInstance';

export function CartPage() {
  const { cart, isLoadingCart, cartError, clearCart, fetchCart } = useCart();
  const navigate = useNavigate();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  
  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to clear your entire cart?")) {
      await clearCart();
    }
  };

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) {
      alert("Your cart is empty."); // TODO: Replace with a toast notification later
      return;
    }

    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      const response = await axiosInstance.post('/orders');

      if (response.status === 201) {
        const createdOrder = response.data;
        alert(`Order placed successfully! Order ID: ${createdOrder._id}`);

        await fetchCart();

        navigate('/orders');
      } else {
          throw new Error("Unexpected response status during checkout.");
      }

    } catch (err: unknown) {
        console.error("Checkout failed:", err);
        const error = err as { response?: { data?: { message?: string } } };
        const message = error.response?.data?.message ?? "Failed to place order. Please try again.";
        setCheckoutError(message);
        alert(`Error: ${message}`); // TODO: Replace with a toast notification later
    } finally {
        setIsCheckingOut(false);
    }
};

  if (isLoadingCart) {
    return <div className="text-center p-10">Loading cart...</div>;
  }

  if (cartError) {
    return <div className="text-center p-10 text-red-600">Error loading cart: {cartError}</div>;
  }

  const items = cart?.items ?? [];
  const subtotal = cart?.totalPrice ?? 0;
  const total = subtotal;

  if (!items || items.length === 0) {
    return (
      <div className="text-center p-10">
          <h1 className="text-2xl font-semibold mb-4">Your Shopping Cart is Empty</h1>
          <p className="text-gray-600 mb-6">Looks like you haven't added anything yet.</p>
          <Link
              to="/"
              className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition duration-150"
          >
              Start Shopping
          </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Your Shopping Cart</h1>
        {checkoutError && <p className="text-sm text-red-500">{checkoutError}</p>}
        {items.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleClearCart} className="text-sm text-red-600 hover:text-red-800 transition duration-150" disabled={items.length === 0}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cart
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {items.map((item) => (
            <CartItem
              key={item.productId}
              item={item}
            />
          ))}
        </div>
        <div className="md:col-span-1">
          <CartSummary subtotal={subtotal} total={total} onCheckout={handleCheckout} isCheckingOut={isCheckingOut} />
        </div>
      </div>

    </div>
  )
}
