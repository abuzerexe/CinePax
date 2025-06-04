import express, { RequestHandler } from 'express';
import { verifyToken, isAdmin } from '../middleware/auth.middleware';
import {
    addShowtime,
    getAllShowtimes,
    deleteShowtime,
    getShowtimeById
} from '../controllers/showtime.controller';

const router = express.Router();

router.post('/', verifyToken, isAdmin, addShowtime as RequestHandler);
router.get('/', getAllShowtimes); 
router.get('/:id', getShowtimeById as RequestHandler);
router.delete('/:id', verifyToken, isAdmin, deleteShowtime as RequestHandler);

export default router; 