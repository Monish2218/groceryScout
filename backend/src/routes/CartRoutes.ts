import { Router } from 'express';
import * as CartController from '../controllers/CartController';
import { protect } from '../middleware/authMiddleware';
import { addItemsSchema, removeItemSchema, updateItemSchema } from '../validation/zodSchema';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

router.use(protect);

router.get('/', CartController.get);
router.post('/items', validateRequest(addItemsSchema), CartController.addItems);
router.put('/items/:productId', validateRequest(updateItemSchema), CartController.updateItem);
router.delete('/items/:productId', validateRequest(removeItemSchema), CartController.removeItem);
router.delete('/', CartController.clear);

export default router;