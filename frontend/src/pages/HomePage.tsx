import type React from "react"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { ProductCard } from "@/components/ProductCard"

const products = [
  {
    _id: "1",
    name: "Fresh Organic Tomatoes",
    price: 40,
    unit: "kg",
    unitQuantity: 1,
    imageUrl: "/placeholder.svg?height=300&width=300",
  },
  {
    _id: "2",
    name: "Premium Basmati Rice",
    price: 150,
    unit: "kg",
    unitQuantity: 1,
    imageUrl: "/placeholder.svg?height=300&width=300",
  },
  {
    _id: "3",
    name: "Farm Fresh Eggs",
    price: 80,
    unit: "dozen",
    unitQuantity: 1,
    imageUrl: "/placeholder.svg?height=300&width=300",
  },
  {
    _id: "4",
    name: "Organic Baby Spinach",
    price: 30,
    unit: "g",
    unitQuantity: 100,
    imageUrl: "/placeholder.svg?height=300&width=300",
  },
  {
    _id: "5",
    name: "Fresh Whole Wheat Bread",
    price: 35,
    unit: "piece",
    unitQuantity: 1,
    imageUrl: "/placeholder.svg?height=300&width=300",
  },
  {
    _id: "6",
    name: "Organic Honey",
    price: 250,
    unit: "g",
    unitQuantity: 500,
    imageUrl: "/placeholder.svg?height=300&width=300",
  },
]

const HomePage: React.FC = () => {
  const handleOpenAIHelper = () => {
    console.log("AI Helper clicked")
  }

  const handleAddToCart = (productId: string) => {
    console.log(`Added product ${productId} to cart`)
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-16 md:py-24 bg-gradient-to-br from-green-50 to-green-100">
        <div className="container px-4 mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Grocery Shopping, Simplified
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Let AI turn your favorite recipes into ready-to-buy shopping lists
          </p>
          <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white font-medium px-8">
            Try the Recipe Helper
          </Button>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Shop by Category</h2>

          {/* Placeholder for category items - will be populated later */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* These are placeholder divs that will be replaced with actual category components */}
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="aspect-square rounded-lg bg-green-100 flex items-center justify-center p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="text-green-800 font-medium text-center">Category {index + 1}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Products Section */}
      <section className="py-12 md:py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Popular Products</h2>

          {/* Placeholder for product items - will be populated with ProductCard components */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} />
          ))}
          </div>
        </div>
      </section>

      {/* AI Helper Floating Action Button */}
      <button
        onClick={handleOpenAIHelper}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-green-600 text-white shadow-lg hover:bg-green-700 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        aria-label="Open AI Helper"
      >
        <Sparkles className="w-6 h-6" />
      </button>
    </div>
  )
}

export default HomePage

