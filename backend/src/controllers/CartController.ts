import { Request, Response } from 'express';
import * as CartService from '../services/CartService';

// Get user's cart
export const get = async (req: Request, res: Response): Promise<void> => {
    try {
        // req.user should be populated by the 'protect' middleware
        if (!req.user?.id) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        const cart = await CartService.getCart(req.user.id);
        res.status(200).json(cart);
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Get Cart Error:', error);
        res.status(500).json({ message: 'Server error retrieving cart', error: errorMessage });
    }
};

// Add multiple items to cart
export const addItems = async (req: Request, res: Response): Promise<void> => {
    try {
         if (!req.user?.id) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        // Expecting body like: { items: [{ productId: "...", quantity: 1 }, ...] }
        const itemsToAdd = req.body.items;
        if (!Array.isArray(itemsToAdd) || itemsToAdd.length === 0) {
             res.status(400).json({ message: 'Invalid request body: "items" array is required.' });
             return;
        }
        // Basic validation of item structure within the array
        const validItems = itemsToAdd.filter(item => item.productId && typeof item.quantity === 'number' && item.quantity > 0);
        if(validItems.length !== itemsToAdd.length) {
             console.warn("Some invalid items were filtered during addItems request.");
             // Decide if to proceed with valid items or reject the whole request
             // Let's proceed with valid ones for now
        }
         if (validItems.length === 0) {
            res.status(400).json({ message: 'No valid items provided to add.' });
            return;
        }


        const cart = await CartService.addItemsToCart(req.user.id, validItems);
        res.status(200).json(cart);

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Add Items to Cart Error:', error);
        // Handle specific errors like Product not found if the service throws them
         if (errorMessage.includes("Product with ID")) {
             res.status(404).json({ message: errorMessage });
         } else {
            res.status(500).json({ message: 'Server error adding items to cart', error: errorMessage });
         }
    }
};


// Update quantity of a specific item
export const updateItem = async (req: Request, res: Response): Promise<void> => {
    try {
         if (!req.user?.id) {
             res.status(401).json({ message: 'Not authorized' });
             return;
         }
         const { productId } = req.params;
         const { quantity } = req.body;

         if (typeof quantity !== 'number' || quantity <= 0) {
             res.status(400).json({ message: 'Invalid quantity provided. Must be a number greater than 0.' });
             return;
         }

         const cart = await CartService.updateCartItemQuantity(req.user.id, productId, quantity);
         res.status(200).json(cart);

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Update Cart Item Error:', error);
         if (errorMessage.includes("Quantity must be") || errorMessage.includes("Invalid Product ID")) {
             res.status(400).json({ message: errorMessage });
         } else if (errorMessage.includes("Item not found")) {
              res.status(404).json({ message: errorMessage });
         }
          else {
            res.status(500).json({ message: 'Server error updating cart item', error: errorMessage });
         }
    }
};

// Remove a specific item from the cart
export const removeItem = async (req: Request, res: Response): Promise<void> => {
    try {
         if (!req.user?.id) {
             res.status(401).json({ message: 'Not authorized' });
             return;
         }
         const { productId } = req.params;

         const cart = await CartService.removeCartItem(req.user.id, productId);
         res.status(200).json(cart);

    } catch (error: unknown) {
         const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
         console.error('Remove Cart Item Error:', error);
         if (errorMessage.includes("Invalid Product ID")) {
             res.status(400).json({ message: errorMessage });
         } else if (errorMessage.includes("Item not found")) {
              res.status(404).json({ message: errorMessage });
         } else {
            res.status(500).json({ message: 'Server error removing cart item', error: errorMessage });
         }
    }
};

// Clear the entire cart
export const clear = async (req: Request, res: Response): Promise<void> => {
     try {
         if (!req.user?.id) {
             res.status(401).json({ message: 'Not authorized' });
             return;
         }
         const cart = await CartService.clearCart(req.user.id);
         res.status(200).json(cart);
     } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Clear Cart Error:', error);
        res.status(500).json({ message: 'Server error clearing cart', error: errorMessage });
     }
};