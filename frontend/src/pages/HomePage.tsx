import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { ProductCard } from "@/components/ProductCard"
import axiosInstance from "@/api/axiosInstance"

interface Product {
  _id: string;
  name: string;
  price: number;
  unit: string;
  unitQuantity: number;
  imageUrl?: string;
  // Add other fields like description, category if needed for display/filtering
}

const HomePage: React.FC = () => {

  const [products, setProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true)
  const [productError, setProductError] = useState<string | null>(null)
  // --- State for AI Helper Modal (Add later) ---
  // const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
        setIsLoadingProducts(true);
        setProductError(null);
        try {
            // Fetching first page, default limit (e.g., 12 products)
            const response = await axiosInstance.get('/products?limit=12');
            setProducts(response.data.products ?? []); // Assuming backend sends { products: [...] }
        } catch (err: unknown) {
            console.error("Failed to fetch products:", err);
            const error = err as { response?: { data?: { message?: string } } };
            setProductError(error.response?.data?.message ?? "Could not load products.");
        } finally {
            setIsLoadingProducts(false);
        }
    };

    fetchProducts();
  }, []);

  const handleOpenAIHelper = () => {
    console.log("AI Helper clicked")
    // setIsModalOpen(true); // Add later
    alert("AI Helper Modal Triggered! (Placeholder)");
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
          {isLoadingProducts && <p className="text-gray-500">Loading products...</p>}
          {productError && <p className="text-red-500">{productError}</p>}
          {!isLoadingProducts && !productError && products.length === 0 && (
            <p>No products found.</p> // Empty state
          )}

          {!isLoadingProducts && !productError && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                    />
                ))}
            </div>
          )}
        </div>
      </section>

      {/* AI Helper Floating Action Button */}
      <button
        onClick={handleOpenAIHelper}
        title="AI Recipe Helper"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-green-600 text-white shadow-lg hover:bg-green-700 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        aria-label="Open AI Helper"
      >
        <Sparkles className="w-6 h-6" />
      </button>

      {/* AI Helper Modal Instance (Add later) */}
      {/* <AIHelperModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} ... /> */}
    </div>
  )
}

export default HomePage

