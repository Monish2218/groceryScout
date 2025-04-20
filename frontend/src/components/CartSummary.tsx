import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface CartSummaryProps {
  readonly subtotal: number
  readonly total: number
  readonly onCheckout: () => void
}

export function CartSummary({ subtotal, total, onCheckout }: CartSummaryProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Order Summary</h2>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">₹{subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Estimated Taxes</span>
          <span className="text-gray-500">Calculated at checkout</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span className="text-gray-500">Calculated at checkout</span>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="flex justify-between mb-6">
        <span className="text-lg font-bold">Total</span>
        <span className="text-lg font-bold">₹{total.toFixed(2)}</span>
      </div>

      <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3" onClick={onCheckout}>
        Proceed to Checkout
      </Button>

      <p className="text-xs text-center text-gray-500 mt-4">Taxes and shipping calculated at checkout</p>
    </div>
  )
}
