import express, { RequestHandler } from 'express';
import { signupUser, loginUser, logoutUser } from '../controllers/customer.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/signup', signupUser as RequestHandler);
router.post('/signin', loginUser as RequestHandler);

router.post('/logout', verifyToken, logoutUser as RequestHandler);

export default router; 