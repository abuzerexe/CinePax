import express, { RequestHandler } from 'express';
import { verifyToken, isAdmin } from '../middleware/auth.middleware';
import {
    addTheater,
    getAllTheaters,
    getTheaterById,
    getTheaterShowtimes,
    deleteTheater,
    updateTheater
} from '../controllers/theater.controller';

const router = express.Router();

router.post('/', verifyToken, isAdmin, addTheater as RequestHandler);
router.get('/', getAllTheaters as RequestHandler);
router.get('/:id', getTheaterById as unknown as RequestHandler);
router.get('/:id/showtimes', getTheaterShowtimes as unknown as RequestHandler);
router.put('/:id', verifyToken, isAdmin, updateTheater as unknown as RequestHandler);
router.delete('/:id', verifyToken, isAdmin, deleteTheater as unknown as RequestHandler);

export default router; 