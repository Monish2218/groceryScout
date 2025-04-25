import { Router } from 'express';
import * as RecipeController from '../controllers/RecipeController';
import { protect } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { processRecipeSchema } from '../validation/zodSchema';

const router = Router();

router.post('/process', protect, validateRequest(processRecipeSchema), RecipeController.processRecipe);

export default router;