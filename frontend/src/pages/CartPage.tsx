import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CartItem } from "../components/CartItem"
import { CartSummary } from "../components/CartSummary"
import { useCart } from "@/context/CartContext"
import { Link } from "react-router-dom"

export function CartPage() {
  const { cart, isLoadingCart, cartError, clearCart } = useCart();
  
  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to clear your entire cart?")) {
        await clearCart();
        // Optionally show feedback
    }
  };

  const handleCheckout = () => {
    console.log("TODO: Implement Checkout");
    alert("Checkout Process Started! (Placeholder)");
  };

  if (isLoadingCart) {
    return <div className="text-center p-10">Loading cart...</div>; // Loading state
  }

  if (cartError) {
    return <div className="text-center p-10 text-red-600">Error loading cart: {cartError}</div>; // Error state
  }

  const items = cart?.items ?? []; // Default to empty array if cart or items are null/undefined
  const subtotal = cart?.totalPrice ?? 0; // Use totalPrice from cart object
  const total = subtotal; // Add tax/shipping later if needed

  // Empty Cart Message
  if (!items || items.length === 0) {
    return (
      <div className="text-center p-10">
          <h1 className="text-2xl font-semibold mb-4">Your Shopping Cart is Empty</h1>
          <p className="text-gray-600 mb-6">Looks like you haven't added anything yet.</p>
          <Link
              to="/products" // Link to products page
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
        {items.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleClearCart} className="text-sm text-red-600 hover:text-red-800 transition duration-150">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cart
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-medium text-gray-600 mb-4">Your cart is currently empty</h2>
          <p className="text-gray-500 mb-6">Looks like you haven't added any items to your cart yet.</p>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <a href="/products">Continue Shopping</a>
          </Button>
        </div>
      ) : (
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
            <CartSummary subtotal={subtotal} total={total} onCheckout={handleCheckout} />
          </div>
        </div>
      )}
    </div>
  )
}
