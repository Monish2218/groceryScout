import { Router } from 'express';
import * as RecipeController from '../controllers/RecipeController'; // Adjust path
import { protect } from '../middleware/authMiddleware'; // Import auth middleware

const router = Router();

// @route   POST api/recipes/process
// @desc    Process recipe name + servings using AI to get ingredients (and later map them)
// @access  Private (Requires login)
router.post('/process', protect, RecipeController.processRecipe);


export default router;