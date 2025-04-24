import { Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { type CartItem } from "@/api/cartApi";
import { useRemoveCartItem, useUpdateCartItem } from "@/queries/useCartQueries";

interface CartItemProps {
  readonly item: CartItem
}

export function CartItem({ item }: CartItemProps) {
  const updateItemMutation = useUpdateCartItem();
  const removeItemMutation = useRemoveCartItem();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1 || updateItemMutation.isPending) return;
    updateItemMutation.mutate({ productId: item.productId, quantity: newQuantity });
  };

  const handleRemove = () => {
    if (removeItemMutation.isPending) return;
    removeItemMutation.mutate(item.productId);
  };

  const isUpdatingThisItem = updateItemMutation.isPending && updateItemMutation.variables?.productId === item.productId;
  const isRemovingThisItem = removeItemMutation.isPending && removeItemMutation.variables === item.productId;

  const itemTotal = (item.quantity * item.pricePerUnit).toFixed(2);

  return (
    <div className="flex items-center border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex-shrink-0">
        <img src={item.imageUrl ?? 'https://via.placeholder.com/80'} alt={item.name} className="w-20 h-20 object-cover rounded" />
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
          onClick={() => handleQuantityChange(item.quantity - 1)}
          disabled={item.quantity <= 1 || isUpdatingThisItem}
          aria-label="Decrease quantity"
        >
          <Minus className="h-4 w-4" />
        </Button>

        <span className="text-sm font-medium w-8 text-center">
          {isUpdatingThisItem ? '...' : item.quantity} {/* Show loading indication */}
        </span>

        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8" 
          onClick={() => handleQuantityChange(item.quantity + 1)}
          disabled={isUpdatingThisItem}
          aria-label="Increase quantity"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-right min-w-[80px]">
        <div className="font-medium">₹{itemTotal}</div>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:text-red-500 mt-1 h-8 px-2"
          onClick={handleRemove}
          disabled={isRemovingThisItem}
          aria-label="Remove from cart"
        >
          {isRemovingThisItem ? (
            <svg className="animate-spin h-5 w-5 text-red-500" ></svg>
          ) : (
            <>
              <Trash2 className="h-4 w-4 mr-1" />
              Remove
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
