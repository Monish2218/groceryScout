import { Router } from 'express';
import * as ProductController from '../controllers/ProductController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.get('/search', ProductController.search);
router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getById);
router.post('/', protect, ProductController.create);
router.put('/:id', protect, ProductController.update); 
router.delete('/:id', protect, ProductController.remove);

export default router;