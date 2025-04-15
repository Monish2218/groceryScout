import { Router } from 'express';
import * as ProductController from '../controllers/ProductController'; // Adjust path
// TODO: Import authMiddleware later to protect routes like create, update, delete

const router = Router();

// @route   GET api/products/search
// @desc    Search products using text index
// @access  Public
router.get('/search', ProductController.search); // Place search before :id

// @route   GET api/products
// @desc    Get all products (with pagination/filtering)
// @access  Public
router.get('/', ProductController.getAll);

// @route   GET api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', ProductController.getById);

// @route   POST api/products
// @desc    Create a new product
// @access  Private (TODO: Add authMiddleware)
router.post('/', /* authMiddleware, isAdminMiddleware?, */ ProductController.create);

// @route   PUT api/products/:id
// @desc    Update a product
// @access  Private (TODO: Add authMiddleware)
router.put('/:id', /* authMiddleware, isAdminMiddleware?, */ ProductController.update);

// @route   DELETE api/products/:id
// @desc    Delete a product
// @access  Private (TODO: Add authMiddleware)
router.delete('/:id', /* authMiddleware, isAdminMiddleware?, */ ProductController.remove);


export default router;