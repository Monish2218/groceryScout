import React, { useState, useCallback } from "react";
import { Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from '@/api/productsApi';
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { AIHelperModal } from "@/components/AIHelperModal";
import axiosInstance from "@/api/axiosInstance";
import { useAddToCart } from '@/queries/useCartQueries';

export interface Product {
  _id: string;
  name: string;
  price: number;
  unit: string;
  unitQuantity: number;
  imageUrl?: string;
}

export interface MatchedItemType {
  originalIngredientName: string;
  originalQuantity: string;
  matchedProduct: Product & { _id: string };
  calculatedQuantityNeeded: number;
  calculationNotes?: string;
}

export interface UnavailableItemType {
  originalIngredientName: string;
  originalQuantity: string;
  reason: string;
}

export interface RecipeApiResponse {
  recipeName: string;
  servings: number;
  matchedItems: MatchedItemType[];
  unavailableItems: UnavailableItemType[];
  recipeSteps: string[];
}

export interface SelectionState {
  [productId: string]: {
      selected: boolean;
      quantity: number;
  };
}

const HomePage: React.FC = () => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);
  const [recipeResponse, setRecipeResponse] = useState<RecipeApiResponse | null>(null);
  const [selectionState, setSelectionState] = useState<SelectionState>({});
  const [aiError, setAiError] = useState<string | null>(null);
  const addToCartMutation = useAddToCart();

  const {
    data: productData,
    isLoading: isLoadingProducts,
    isError: isProductError,
    error: productError,
  } = useQuery({
    queryKey: ['products', { limit: 12, page: 1}],
    queryFn: () => fetchProducts({ limit: 12, page: 1 }),
  })

  const handleOpenAIHelper = useCallback(() => {
    setRecipeResponse(null);
    setSelectionState({});
    setAiError(null);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleRecipeSubmit = useCallback(async (formData: { recipeName: string; servings: number }) => {
    setIsLoadingRecipe(true);
    setAiError(null);
    setRecipeResponse(null);
    setSelectionState({});
    console.log("Submitting recipe:", formData);

    try {
      const response = await axiosInstance.post<RecipeApiResponse>('/recipes/process', formData);
      console.log("Recipe API Response:", response.data);
      setRecipeResponse(response.data);

      const initialSelections: SelectionState = {};
      response.data.matchedItems.forEach(item => {
        initialSelections[item.matchedProduct._id] = {
          selected: true,
          quantity: item.calculatedQuantityNeeded >= 1 ? item.calculatedQuantityNeeded : 1,
        };
      });
      setSelectionState(initialSelections);

    } catch (err: unknown) {
        console.error("Failed to process recipe:", err);
        const error = err as { response?: { data?: { message?: string } } };
        setAiError(error.response?.data?.message ?? "Failed to process recipe.");
    } finally {
        setIsLoadingRecipe(false);
    }
  }, []);

  const handleItemCheckboxChange = useCallback((productId: string, isChecked: boolean) => {
    setSelectionState(prev => ({
      ...prev,
      [productId]: { ...prev[productId], selected: isChecked }
    }));
  }, []);

  const handleItemQuantityChange = useCallback((productId: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      setSelectionState(prev => ({
        ...prev,
        [productId]: { ...prev[productId], quantity: newQuantity }
      }));
    }
  }, []);

  const handleAddSelectedToCart = useCallback(async () => {
    const itemsToAdd = Object.entries(selectionState)
      .filter(([, state]) => state.selected && state.quantity > 0)
      .map(([productId, state]) => ({
        productId: productId,
        quantity: state.quantity
      }));

    if (itemsToAdd.length === 0) {
      setAiError("Please select at least one item to add to the cart.");
      return;
    }

    addToCartMutation.mutate({ items: itemsToAdd }, {
      onSuccess: () => {
        setIsModalOpen(false);
        alert(`${itemsToAdd.length} item(s) added to cart!`); 
      },
      onError: (error: unknown) => {
        const err = error as { message?: string };
        setAiError(err.message ?? "Could not add items to cart.");
      }
    });
  }, [selectionState, addToCartMutation, setIsModalOpen, setAiError]);

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
          <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white font-medium px-8" onClick={handleOpenAIHelper}>
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
          {isProductError && <p className="text-red-500">{productError.message ?? "Could not load products."}</p>}
          {!isLoadingProducts && !isProductError && (!productData || productData.products.length === 0) && (
            <p>No products found.</p>
          )}

          {!isLoadingProducts && !productError && productData && productData.products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {productData.products.map((product) => (
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

      {/* AI Helper Modal Instance */}
      <AIHelperModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmitRecipe={handleRecipeSubmit}
        isLoadingRecipe={isLoadingRecipe}
        recipeResponse={recipeResponse}
        selectionState={selectionState}
        onItemCheckboxChange={handleItemCheckboxChange}
        onItemQuantityChange={handleItemQuantityChange}
        onAddItemsToCart={handleAddSelectedToCart}
        isAddingToCart={addToCartMutation.isPending}
        error={aiError}
      />
    </div>
  )
}

export default HomePage

