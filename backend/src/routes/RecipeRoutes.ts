import { Router } from 'express';
import * as RecipeController from '../controllers/RecipeController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/process', protect, RecipeController.processRecipe);

export default router;