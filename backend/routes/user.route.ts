import express, { RequestHandler } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import {
  getAllMoviesWithShowtimes,
  getMovieDetails,
  getShowtimeDetails,
  bookTicket,
  getUserTickets,
  searchMovies,
  filterShowtimes,
  getBookingHistory,
  cancelBooking
} from '../controllers/user.controller';

const router = express.Router();

// Public routes
router.get('/movies', getAllMoviesWithShowtimes as RequestHandler);
router.get('/movies/search', searchMovies as RequestHandler);
router.get('/showtimes', filterShowtimes as RequestHandler);
router.get('/movies/:movieId', getMovieDetails as unknown as RequestHandler);
router.get('/showtimes/:showtimeId', getShowtimeDetails as unknown as RequestHandler);

// Protected routes (require authentication)
router.post('/book', verifyToken, bookTicket as unknown as RequestHandler);
router.get('/tickets', verifyToken, getUserTickets as RequestHandler);
router.get('/bookings', verifyToken, getBookingHistory as RequestHandler);
router.delete('/bookings/:ticketId', verifyToken, cancelBooking as unknown as RequestHandler);

export default router; 