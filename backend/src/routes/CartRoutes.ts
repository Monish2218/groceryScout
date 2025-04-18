import { Router } from 'express';
import * as CartController from '../controllers/CartController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.get('/', CartController.get);
router.post('/items', CartController.addItems);
router.put('/items/:productId', CartController.updateItem);
router.delete('/items/:productId', CartController.removeItem);
router.delete('/', CartController.clear);

export default router;