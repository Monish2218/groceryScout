import { Router } from 'express';
import * as OrderController from '../controllers/OrderController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.post('/', OrderController.create);
router.get('/', OrderController.getUserOrders);
router.get('/:orderId', OrderController.getUserOrderById);

export default router;