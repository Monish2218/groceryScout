"use client"

import { Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CartItemType } from "../pages/CartPage"

interface CartItemProps {
  readonly item: CartItemType
  readonly onQuantityChange: (itemId: string, newQuantity: number) => void
  readonly onRemoveItem: (itemId: string) => void
}

export function CartItem({ item, onQuantityChange, onRemoveItem }: CartItemProps) {
  const handleIncrement = () => {
    onQuantityChange(item.id, item.quantity + 1)
  }

  const handleDecrement = () => {
    if (item.quantity > 1) {
      onQuantityChange(item.id, item.quantity - 1)
    }
  }

  const handleRemove = () => {
    onRemoveItem(item.id)
  }

  const itemTotal = item.pricePerUnit * item.quantity

  return (
    <div className="flex items-center border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex-shrink-0">
        <img src={item.imageUrl || "/placeholder.svg"} alt={item.name} className="w-20 h-20 object-cover rounded" />
      </div>

      <div className="ml-4 flex-grow">
        <h3 className="font-medium text-gray-800">{item.name}</h3>
        <p className="text-sm text-gray-500">
          ₹{item.pricePerUnit.toFixed(2)} / {item.unit}
        </p>
      </div>

      <div className="flex items-center space-x-2 mx-4">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={handleDecrement}
          disabled={item.quantity <= 1}
        >
          <Minus className="h-4 w-4" />
        </Button>

        <span className="w-8 text-center">{item.quantity}</span>

        <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleIncrement}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-right min-w-[80px]">
        <div className="font-medium">₹{itemTotal.toFixed(2)}</div>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:text-red-500 mt-1 h-8 px-2"
          onClick={handleRemove}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Remove
        </Button>
      </div>
    </div>
  )
}
