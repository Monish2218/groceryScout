// backend/src/routes/CartRoutes.ts
import { Router } from 'express';
import * as CartController from '../controllers/CartController'; // Adjust path
import { protect } from '../middleware/authMiddleware'; // Import protect middleware

const router = Router();

// ALL cart routes should be protected
router.use(protect); // Apply middleware to all routes defined below in this file

// @route   GET api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', CartController.get);

// @route   POST api/cart/items
// @desc    Add multiple items to cart (used after AI processing confirmation)
// @access  Private
// @body    { "items": [{ "productId": "...", "quantity": 1 }, ...] }
router.post('/items', CartController.addItems);

// @route   PUT api/cart/items/:productId
// @desc    Update quantity of a specific item in the cart
// @access  Private
// @body    { "quantity": 3 }
router.put('/items/:productId', CartController.updateItem);

// @route   DELETE api/cart/items/:productId
// @desc    Remove a specific item from the cart
// @access  Private
router.delete('/items/:productId', CartController.removeItem);

// @route   DELETE api/cart
// @desc    Clear all items from the cart
// @access  Private
router.delete('/', CartController.clear);


export default router;