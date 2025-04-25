import { Router } from 'express';
import * as AuthController from '../controllers/AuthController';
import { loginSchema, registerSchema } from '../validation/zodSchema';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

router.post('/register', validateRequest(registerSchema), AuthController.register);
router.post('/login', validateRequest(loginSchema), AuthController.login);

export default router;