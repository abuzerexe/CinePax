import express from 'express';
import { verifyToken, isAdmin } from '../middleware/auth.middleware';
import {
    getAllPayments,
    getPaymentsByDateRange
} from '../controllers/payment.controller';

const router = express.Router();

router.get('/', verifyToken, isAdmin, getAllPayments);
router.get('/date-range', verifyToken, isAdmin, getPaymentsByDateRange);

export default router; 