"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const user_controller_1 = require("../controllers/user.controller");
const router = express_1.default.Router();
// Public routes
router.get('/movies', user_controller_1.getAllMoviesWithShowtimes);
router.get('/movies/search', user_controller_1.searchMovies);
router.get('/showtimes', user_controller_1.filterShowtimes);
router.get('/movies/:movieId', user_controller_1.getMovieDetails);
router.get('/showtimes/:showtimeId', user_controller_1.getShowtimeDetails);
// Protected routes (require authentication)
router.post('/book', auth_middleware_1.verifyToken, user_controller_1.bookTicket);
router.get('/tickets', auth_middleware_1.verifyToken, user_controller_1.getUserTickets);
router.get('/bookings', auth_middleware_1.verifyToken, user_controller_1.getBookingHistory);
router.delete('/bookings/:ticketId', auth_middleware_1.verifyToken, user_controller_1.cancelBooking);
exports.default = router;
