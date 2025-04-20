"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CartItem } from "../components/CartItem"
import { CartSummary } from "../components/CartSummary"

export interface CartItemType {
  id: string
  name: string
  imageUrl: string
  pricePerUnit: number
  unit: string
  quantity: number
}

interface CartPageProps {
  readonly initialCartItems: CartItemType[]
  readonly onClearCart: () => void
}

export function CartPage({ initialCartItems, onClearCart = () => {} }: CartPageProps) {
  const [cartItems, setCartItems] = useState<CartItemType[]>(initialCartItems)

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item)),
    )
  }

  const handleRemoveItem = (itemId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId))
  }

  const handleClearCart = () => {
    setCartItems([])
    onClearCart()
  }

  const handleCheckout = () => {
    console.log("Proceeding to checkout with items:", cartItems)
    // Implement checkout logic here
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.pricePerUnit * item.quantity, 0)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Your Shopping Cart</h1>
        {cartItems.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleClearCart} className="text-gray-500 hover:text-gray-700">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cart
          </Button>
        )}
      </div>

      {cartItems.length === 0 ? (
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
            {cartItems.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onQuantityChange={handleQuantityChange}
                onRemoveItem={handleRemoveItem}
              />
            ))}
          </div>
          <div className="md:col-span-1">
            <CartSummary subtotal={subtotal} total={subtotal} onCheckout={handleCheckout} />
          </div>
        </div>
      )}
    </div>
  )
}
