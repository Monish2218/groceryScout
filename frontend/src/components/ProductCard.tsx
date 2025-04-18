import { ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { cn } from "@/lib/utils"

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
  readonly onAddToCart: (productId: string) => void
  readonly className?: string
}

export function ProductCard({ product, onAddToCart, className }: ProductCardProps) {
  const handleAddToCart = () => {
    onAddToCart(product._id)
  }

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-200 hover:shadow-lg bg-white border border-gray-200 shadow-sm",
        className,
      )}
    >
      <div className="relative aspect-square w-full">
        <img
          src={product.imageUrl ?? "/placeholder.svg?height=300&width=300"}
          alt={product.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover rounded-t-lg"
        />
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
          className="w-full transition-colors hover:bg-green-600 hover:text-white hover:border-green-600"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  )
}
