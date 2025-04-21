import type React from "react"

import { useState } from "react"
import { X, Minus, Plus, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { MatchedItemType, RecipeApiResponse, SelectionState, UnavailableItemType } from "@/pages/HomePage"
import { CheckedState } from "@radix-ui/react-checkbox"

// Type definitions

interface AIHelperModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly onSubmitRecipe: (formData: { recipeName: string; servings: number }) => void
  readonly isLoadingRecipe: boolean
  readonly recipeResponse: RecipeApiResponse | null;
  readonly selectionState: SelectionState;
  readonly onAddItemsToCart: () => void
  readonly isAddingToCart: boolean
  readonly onItemCheckboxChange: (itemId: string, isChecked: boolean) => void
  readonly onItemQuantityChange: (itemId: string, newQuantity: number) => void
  readonly error: string | null
}

export function AIHelperModal({
  isOpen,
  onClose,
  onSubmitRecipe,
  isLoadingRecipe,
  recipeResponse,
  selectionState,
  onItemCheckboxChange,
  onItemQuantityChange,
  onAddItemsToCart,
  isAddingToCart,
  error,
}: AIHelperModalProps) {
  const [recipeName, setRecipeName] = useState("")
  const [servings, setServings] = useState(2)
  const hasResults = recipeResponse && !isLoadingRecipe
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmitRecipe({ recipeName, servings })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl w-full overflow-y-auto max-h-[90vh] p-6">
        <DialogHeader className="relative">
          <DialogTitle className="text-2xl font-bold text-center">AI Recipe Shopping Assistant</DialogTitle>
          <Button variant="ghost" size="icon" className="absolute right-0 top-0" onClick={onClose}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recipe-name">Recipe Name</Label>
              <Input
                id="recipe-name"
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                placeholder="e.g., Vegetable Lasagna"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="servings">Number of Servings</Label>
              <Input
                id="servings"
                type="number"
                min={1}
                value={servings}
                onChange={(e) => setServings(Number.parseInt(e.target.value))}
                required
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={isLoadingRecipe}
          >
            {isLoadingRecipe ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Finding Ingredients & Steps...
              </>
            ) : (
              "Find Ingredients & Steps"
            )}
          </Button>
        </form>

        {hasResults && (
          <div className="mt-6 space-y-6">
            <Separator />

            {/* Recipe Steps Section */}
            {recipeResponse.recipeSteps?.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Recipe Steps</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  {recipeResponse.recipeSteps.map((step, index) => (
                    <li key={index} className="text-sm text-gray-700">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Available Items Section */}
            {recipeResponse.matchedItems?.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Available Items</h3>
                <div className="space-y-2">
                  {recipeResponse.matchedItems.map((item) => (
                    <MatchedItemRow
                      key={item.matchedProduct._id}
                      item={item}
                      selection={selectionState[item.matchedProduct._id] || { selected: false, quantity: 0 }}
                      onCheckboxChange={onItemCheckboxChange}
                      onQuantityChange={onItemQuantityChange}
                    />
                  ))}
                </div>
                <Button
                  onClick={onAddItemsToCart}
                  disabled={isAddingToCart || Object.values(selectionState).every(s => !s.selected)}
                  className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isAddingToCart ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding to Cart...
                    </>
                  ) : (
                    "Add Selected Items to Cart"
                  )}
                </Button>
              </div>
            )}

            {/* Unavailable Items Section */}
            {recipeResponse.unavailableItems?.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Unavailable Items</h3>
                <div className="space-y-2">
                  {recipeResponse.unavailableItems.map((item, index) => (
                    <UnavailableItemRow key={`${item.originalIngredientName}-${index}`} item={item} />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Some items couldn't be found or require manual quantity checks.</p>
              </div>
            )}

            {/* Handle case where NO items were found at all */}
            {recipeResponse.matchedItems?.length === 0 && recipeResponse.unavailableItems?.length === 0 && (
              <p className="text-center text-gray-600 py-4">No ingredients were identified for this recipe.</p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

interface MatchedItemRowProps {
  readonly item: MatchedItemType
  readonly selection: { selected: boolean; quantity: number }
  readonly onCheckboxChange: (itemId: string, isChecked: boolean) => void
  readonly onQuantityChange: (itemId: string, newQuantity: number) => void
}

function MatchedItemRow({ item, selection, onCheckboxChange, onQuantityChange }: MatchedItemRowProps) {
  const handleQtyDecrement = () => onQuantityChange(item.matchedProduct._id, selection.quantity - 1);
  const handleQtyIncrement = () => onQuantityChange(item.matchedProduct._id, selection.quantity + 1);
  const handleCheckbox = (checked: CheckedState) => onCheckboxChange(item.matchedProduct._id, checked as boolean);
  
  return (
    <div className="flex items-center gap-3 p-3 rounded-md border border-gray-200 bg-white">
      <Checkbox
        id={`item-${item.matchedProduct._id}`}
        checked={selection.selected}
        onCheckedChange={handleCheckbox}
      />

      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
        <img
          src={item.matchedProduct.imageUrl || `/placeholder.svg?height=48&width=48`}
          alt={item.matchedProduct.name}
          loading="lazy"
          className="h-full w-full object-cover object-center"
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{item.matchedProduct.name}</p>
        <p className="text-xs text-gray-500">(from: {item.originalIngredientName})</p>
      </div>

      <div className="text-right text-xs text-gray-500">
        <p>
        {`₹${item.matchedProduct.price.toFixed(2)} / ${item.matchedProduct.unitQuantity} ${item.matchedProduct.unit}`}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-6 w-6"
          onClick={handleQtyDecrement}
          disabled={selection.quantity <= 1}
        >
          <Minus className="h-3 w-3" />
          <span className="sr-only">Decrease</span>
        </Button>

        <span className="text-sm w-6 text-center">{selection.quantity}</span>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-6 w-6"
          onClick={handleQtyIncrement}
        >
          <Plus className="h-3 w-3" />
          <span className="sr-only">Increase</span>
        </Button>
      </div>
    </div>
  )
}

interface UnavailableItemRowProps {
  readonly item: UnavailableItemType
}

function UnavailableItemRow({ item }: UnavailableItemRowProps) {
  return (
    <div className="flex flex-col p-3 rounded-md border border-gray-200 bg-gray-50">
      <div className="flex justify-between">
        <p className="text-sm font-medium text-gray-900">{item.originalIngredientName}</p>
        <p className="text-sm text-gray-500">{item.originalQuantity}</p>
      </div>
      <p className="text-xs text-red-500 mt-1">{item.reason}</p>
    </div>
  )
}
