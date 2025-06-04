import express, { RequestHandler } from 'express';
import { verifyToken, isAdmin } from '../middleware/auth.middleware';
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
} from '../controllers/admin.controller';

const router = express.Router();

router.get('/users', verifyToken, isAdmin, getAllUsers as RequestHandler);
router.get('/users/:id', verifyToken, isAdmin, getUserById as RequestHandler);
router.post('/users', verifyToken, isAdmin, createUser as RequestHandler);
router.put('/users/:id', verifyToken, isAdmin, updateUser as RequestHandler);
router.delete('/users/:id', verifyToken, isAdmin, deleteUser as RequestHandler);

export default router; 