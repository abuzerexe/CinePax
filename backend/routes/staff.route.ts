import express, { RequestHandler } from 'express';
import { verifyToken, isAdmin } from '../middleware/auth.middleware';
import {
    addStaff,
    getAllStaff,
    deleteStaff
} from '../controllers/staff.controller';

const router = express.Router();

router.post('/', verifyToken, isAdmin, addStaff as RequestHandler);
router.get('/', getAllStaff as RequestHandler); 
router.delete('/:id', verifyToken, isAdmin, deleteStaff as unknown as RequestHandler);

export default router; 