import express, { RequestHandler } from 'express';
import { verifyToken, isAdmin } from '../middleware/auth.middleware';
import { getAllBookings } from '../controllers/booking.controller';

const router = express.Router();

router.get('/', verifyToken, isAdmin, getAllBookings as RequestHandler);

export default router; 