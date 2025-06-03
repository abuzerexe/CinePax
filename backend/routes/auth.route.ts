import express, { RequestHandler } from 'express';
import { signupUser, loginUser, logoutUser } from '../controllers/customer.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.post('/signup', signupUser as RequestHandler);
router.post('/signin', loginUser as RequestHandler);

// Protected routes
router.post('/logout', verifyToken, logoutUser as RequestHandler);

export default router; 