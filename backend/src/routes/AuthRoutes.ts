import { Router } from 'express';
import * as AuthController from '../controllers/AuthController'; // Adjust path

const router = Router();

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', AuthController.register);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', AuthController.login);

export default router;