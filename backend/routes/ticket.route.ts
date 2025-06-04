import express, { RequestHandler } from 'express';
import { verifyToken, isAdmin } from '../middleware/auth.middleware';
import {
    getAllBookedTickets,
    getBookedTicketsByShowtime,
    updateTicketStatus
} from '../controllers/ticket.controller';

const router = express.Router();

router.get('/', verifyToken, isAdmin, getAllBookedTickets as RequestHandler);
router.get('/showtime/:showtimeId', verifyToken, isAdmin, getBookedTicketsByShowtime as unknown as RequestHandler);
router.put('/:ticketId/status', verifyToken, isAdmin, updateTicketStatus as unknown as RequestHandler);

export default router; 