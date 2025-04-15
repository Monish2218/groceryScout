import { Router } from 'express';
import * as ProductController from '../controllers/ProductController'; // Adjust path
import { protect } from '../middleware/authMiddleware';

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
// @access  Private
router.post('/', protect, /* isAdmin?, */ ProductController.create);

// @route   PUT api/products/:id
// @desc    Update a product
// @access  Private
router.put('/:id', protect, /* isAdmin?, */ ProductController.update);

// @route   DELETE api/products/:id
// @desc    Delete a product
// @access  Private 
router.delete('/:id', protect, /* isAdmin?, */  ProductController.remove);


export default router;