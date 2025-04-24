import { ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useAddToCart } from '../queries/useCartQueries';

interface Product {
  _id: string
  name: string
  price: number
  unit: string
  unitQuantity: number
  imageUrl?: string
}

interface ProductCardProps {
  readonly product: Product
  readonly className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const addToCartMutation = useAddToCart();
  
  const handleAddToCart = async () => {
    if (!product?._id) return; 
    addToCartMutation.mutate({ items: [{ productId: product._id, quantity: 1 }] });
  };

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-200 hover:shadow-lg bg-white border border-gray-200 shadow-sm",
        className,
      )}
    >
      <div className="aspect-square w-full overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
            <span>No Image</span>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-medium text-base line-clamp-2 min-h-[3rem]">{product.name}</h3>
        <div className="mt-2 flex items-baseline">
          <span className="font-semibold">{`₹${product.price}`}</span>
          <span className="text-xs text-gray-600 ml-1">{`/ ${product.unitQuantity} ${product.unit}`}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          variant="outline"
          disabled={addToCartMutation.isPending}
          className={`mt-auto w-full flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white 
            ${addToCartMutation.isPending ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'} 
            transition duration-150 ease-in-out`}
        >
        {addToCartMutation.isPending ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Adding...
            </>
        ) : (
            <>
            <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </>
        )}
        </Button>
      </CardFooter>
    </Card>
  )
}
