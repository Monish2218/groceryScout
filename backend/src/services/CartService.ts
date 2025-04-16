// backend/src/services/CartService.ts
import Cart, { ICart, ICartItem } from '../models/Cart'; // Adjust path
import Product, { IProduct } from '../models/Product'; // Need Product model to fetch details
import mongoose from 'mongoose';

// --- Helper Function ---
/**
 * Calculates the total price of cart items.
 */
const calculateCartTotal = (items: ICartItem[]): number => {
    return items.reduce((acc, item) => {
        // Ensure pricePerUnit exists and is a number, default to 0 if not
        const price = typeof item.pricePerUnit === 'number' ? item.pricePerUnit : 0;
        return acc + (item.quantity * price);
    }, 0);
};


// --- Service Methods ---

/**
 * Get the user's cart, creating one if it doesn't exist.
 * @param userId - The ID of the user.
 * @returns The user's cart document.
 */
export const getCart = async (userId: string): Promise<ICart> => {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
        // Create a new cart if one doesn't exist
        cart = new Cart({ userId, items: [], totalPrice: 0 });
        await cart.save();
        console.log(`Created new cart for user ${userId}`);
    }
    return cart;
};

/**
 * Adds an array of items to the user's cart.
 * @param userId - The ID of the user.
 * @param itemsToAdd - Array of objects { productId: string, quantity: number }.
 * @returns The updated cart document.
 * @throws Error if a product is not found or other issues occur.
 */
export const addItemsToCart = async (userId: string, itemsToAdd: { productId: string, quantity: number }[]): Promise<ICart> => {
    const cart = await getCart(userId); // Ensure cart exists

    for (const item of itemsToAdd) {
         if (!mongoose.Types.ObjectId.isValid(item.productId) || item.quantity <= 0) {
            console.warn(`Skipping invalid item: ${JSON.stringify(item)}`);
            continue; // Skip invalid items
         }

        // Find the product in DB to get current details
        const product = await Product.findById(item.productId);
        if (!product) {
            // Option 1: Skip this item and continue
             console.warn(`Product with ID ${item.productId} not found. Skipping item.`);
             continue;
            // Option 2: Throw an error to stop the whole operation
            // throw new Error(`Product with ID ${item.productId} not found.`);
        }

        const existingItemIndex = cart.items.findIndex(
            (cartItem) => cartItem.productId.toString() === item.productId
        );

        if (existingItemIndex > -1) {
            // Item exists, update quantity
            cart.items[existingItemIndex].quantity += item.quantity;
             // Optionally update price if it changed, though snapshotting on add is common
             // cart.items[existingItemIndex].pricePerUnit = product.price;
        } else {
            // Item doesn't exist, add new item
            const cartItem: ICartItem = {
                productId: product._id,
                name: product.name,
                imageUrl: product.imageUrl,
                quantity: item.quantity,
                pricePerUnit: product.price, // Snapshot current price
                unit: product.unit,
                unitQuantity: product.unitQuantity,
            };
            cart.items.push(cartItem);
        }
    }

    // Recalculate total price
    cart.totalPrice = calculateCartTotal(cart.items);
    await cart.save();
    return cart;
};


 /**
 * Updates the quantity of a specific item in the cart.
 * @param userId - The ID of the user.
 * * @param productId - The ID of the product whose cart item quantity needs updating.
 * @param newQuantity - The new quantity (must be > 0).
 * @returns The updated cart document.
 * @throws Error if cart or item not found, or quantity is invalid.
 */
 export const updateCartItemQuantity = async (userId: string, productId: string, newQuantity: number): Promise<ICart> => {
     if (newQuantity <= 0) {
         throw new Error("Quantity must be greater than zero.");
     }
     if (!mongoose.Types.ObjectId.isValid(productId)) {
         throw new Error("Invalid Product ID format.");
     }

     const cart = await getCart(userId);
     const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

     if (itemIndex === -1) {
         throw new Error("Item not found in cart.");
     }

     // Update quantity
     cart.items[itemIndex].quantity = newQuantity;

     // Recalculate total and save
     cart.totalPrice = calculateCartTotal(cart.items);
     await cart.save();
     return cart;
 };


/**
 * Removes an item completely from the user's cart.
 * @param userId - The ID of the user.
 * @param productId - The ID of the product to remove from the cart.
 * @returns The updated cart document.
 * @throws Error if cart or item not found.
 */
export const removeCartItem = async (userId: string, productId: string): Promise<ICart> => {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
         throw new Error("Invalid Product ID format.");
    }

    const cart = await getCart(userId);
    const initialLength = cart.items.length;

    // Filter out the item to remove
    cart.items = cart.items.filter(item => item.productId.toString() !== productId);

    if (cart.items.length === initialLength) {
        throw new Error("Item not found in cart.");
    }

    // Recalculate total and save
    cart.totalPrice = calculateCartTotal(cart.items);
    await cart.save();
    return cart;
};


/**
 * Clears all items from the user's cart.
 * @param userId - The ID of the user.
 * @returns The emptied cart document.
 */
export const clearCart = async (userId: string): Promise<ICart> => {
    const cart = await getCart(userId);

    cart.items = [];
    cart.totalPrice = 0;

    await cart.save();
    return cart;
};