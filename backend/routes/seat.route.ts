import express, { RequestHandler } from 'express';
import { verifyToken, isAdmin } from '../middleware/auth.middleware';
import {
    addSeat,
    getAllSeats,
    deleteSeat
} from '../controllers/seat.controller';

const router = express.Router();

router.post('/', verifyToken, isAdmin, addSeat as RequestHandler);
router.get('/', getAllSeats); 
router.delete('/:id', verifyToken, isAdmin, deleteSeat as RequestHandler);

export default router; 