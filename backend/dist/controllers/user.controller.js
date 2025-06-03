"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelBooking = exports.getBookingHistory = exports.filterShowtimes = exports.searchMovies = exports.getUserTickets = exports.bookTicket = exports.getShowtimeDetails = exports.getMovieDetails = exports.getAllMoviesWithShowtimes = void 0;
const movie_model_1 = __importDefault(require("../model/movie.model"));
const showtime_model_1 = __importDefault(require("../model/showtime.model"));
const ticket_model_1 = __importDefault(require("../model/ticket.model"));
const booking_model_1 = __importDefault(require("../model/booking.model"));
const payment_model_1 = __importDefault(require("../model/payment.model"));
const mongoose_1 = require("mongoose");
const seat_model_1 = __importDefault(require("../model/seat.model"));
// Get all movies with their showtimes
const getAllMoviesWithShowtimes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const movies = yield movie_model_1.default.find().lean();
        const showtimes = yield showtime_model_1.default.find()
            .populate('movieId', 'title description duration genre releaseDate posterUrl')
            .populate('theaterId', 'name location capacity')
            .lean();
        // Group showtimes by movie
        const moviesWithShowtimes = movies.map(movie => {
            const movieShowtimes = showtimes.filter(showtime => showtime.movieId._id.toString() === movie._id.toString());
            return Object.assign(Object.assign({}, movie), { showtimes: movieShowtimes.map(showtime => ({
                    id: showtime._id,
                    theater: showtime.theaterId,
                    startTime: showtime.startTime,
                    endTime: showtime.endTime,
                    price: showtime.price
                })) });
        });
        res.status(200).json({
            success: true,
            count: moviesWithShowtimes.length,
            data: moviesWithShowtimes
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.getAllMoviesWithShowtimes = getAllMoviesWithShowtimes;
// Get movie details with available showtimes and seat availability
const getMovieDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { movieId } = req.params;
        const movie = yield movie_model_1.default.findById(movieId).lean();
        if (!movie) {
            res.status(404).json({ message: 'Movie not found' });
            return;
        }
        const showtimes = yield showtime_model_1.default.find({ movieId })
            .populate('theaterId', 'name location capacity')
            .lean();
        // Get seat availability for each showtime
        const showtimesWithAvailability = yield Promise.all(showtimes.map((showtime) => __awaiter(void 0, void 0, void 0, function* () {
            const bookedTickets = yield ticket_model_1.default.find({ showtime: showtime._id });
            const bookedSeats = bookedTickets.map(ticket => ticket.seat);
            const availableSeats = showtime.theaterId.capacity - bookedSeats.length;
            return {
                id: showtime._id,
                theater: showtime.theaterId,
                startTime: showtime.startTime,
                endTime: showtime.endTime,
                price: showtime.price,
                availableSeats,
                bookedSeats: bookedSeats.length
            };
        })));
        res.status(200).json({
            success: true,
            data: Object.assign(Object.assign({}, movie), { showtimes: showtimesWithAvailability })
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.getMovieDetails = getMovieDetails;
// Get showtime details with seat availability
const getShowtimeDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { showtimeId } = req.params;
        const showtime = yield showtime_model_1.default.findById(showtimeId)
            .populate('movieId', 'title description duration genre releaseDate posterUrl')
            .populate('theaterId', 'name location capacity')
            .lean();
        if (!showtime) {
            res.status(404).json({ message: 'Showtime not found' });
            return;
        }
        const bookedTickets = yield ticket_model_1.default.find({ showtime: showtimeId });
        const bookedSeats = bookedTickets.map(ticket => ticket.seat);
        const availableSeats = showtime.theaterId.capacity - bookedSeats.length;
        res.status(200).json({
            success: true,
            data: Object.assign(Object.assign({}, showtime), { availableSeats, bookedSeats: bookedSeats.length, seatAvailability: {
                    total: showtime.theaterId.capacity,
                    available: availableSeats,
                    booked: bookedSeats.length
                } })
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.getShowtimeDetails = getShowtimeDetails;
// Book a ticket
const bookTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { showtimeId, seatNumber, row } = req.body;
        const customerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!customerId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // Get showtime
        const showtime = yield showtime_model_1.default.findById(showtimeId);
        if (!showtime) {
            return res.status(404).json({ message: "Showtime not found" });
        }
        // Try to acquire pessimistic lock on the seat
        // const lockedSeat = await Seat.acquireLock(
        //   new mongoose.Types.ObjectId(showtimeId),
        //   seatNumber,
        //   row,
        //   new mongoose.Types.ObjectId(customerId)
        // );
        // if (!lockedSeat) {
        //   return res.status(409).json({ message: "Seat is currently being booked by another user" });
        // }
        try {
            // Check if seat is already booked
            const existingTicket = yield ticket_model_1.default.findOne({
                showtime: showtimeId,
                'seat.seatNumber': seatNumber,
                'seat.row': row,
                status: { $ne: 'CANCELLED' }
            });
            if (existingTicket) {
                return res.status(400).json({ message: "Seat is already booked" });
            }
            // Create seat document
            const seat = yield seat_model_1.default.create([{
                    showtimeId,
                    seatNumber,
                    row,
                    status: 'BOOKED',
                    version: 0
                }]);
            // Create ticket
            const ticket = yield ticket_model_1.default.create([{
                    showtime: showtimeId,
                    customer: customerId,
                    seat: seat[0]._id,
                    price: showtime.price,
                    status: 'confirmed'
                }]);
            if (!ticket || !ticket[0]) {
                throw new Error('Failed to create ticket');
            }
            // Create payment
            const payment = yield payment_model_1.default.create([{
                    ticket: ticket[0]._id,
                    amount: showtime.price,
                    paymentMethod: 'ONLINE',
                    paymentStatus: 'COMPLETED'
                }]);
            if (!payment || !payment[0]) {
                throw new Error('Failed to create payment');
            }
            // Create booking record
            const booking = yield booking_model_1.default.create([{
                    userId: customerId,
                    showtimeId,
                    seats: [`${row}${seatNumber}`],
                    totalAmount: showtime.price,
                    status: 'confirmed',
                    paymentStatus: 'paid',
                    ticket: ticket[0]._id,
                    payment: payment[0]._id
                }]);
            if (!booking || !booking[0]) {
                throw new Error('Failed to create booking');
            }
            // Update showtime's available seats
            showtime.availableSeats -= 1;
            yield showtime.save();
            // Release the pessimistic lock
            // await Seat.releaseLock(
            //   new mongoose.Types.ObjectId(showtimeId),
            //   seatNumber,
            //   row,
            //   new mongoose.Types.ObjectId(customerId)
            // );
            // Return success response
            return res.status(201).json({
                success: true,
                message: "Ticket booked successfully",
                data: {
                    ticket: {
                        _id: ticket[0]._id,
                        showtime: showtimeId,
                        customer: customerId,
                        seat: {
                            seatNumber,
                            row
                        },
                        price: showtime.price,
                        status: 'confirmed',
                        purchaseDate: new Date()
                    },
                    payment: {
                        _id: payment[0]._id,
                        ticket: ticket[0]._id,
                        amount: showtime.price,
                        paymentMethod: 'ONLINE',
                        paymentStatus: 'COMPLETED',
                        paymentDate: new Date()
                    },
                    booking: {
                        _id: booking[0]._id,
                        userId: customerId,
                        showtimeId,
                        seats: [`${row}${seatNumber}`],
                        totalAmount: showtime.price,
                        status: 'confirmed',
                        paymentStatus: 'paid'
                    }
                }
            });
        }
        catch (error) {
            // Release the pessimistic lock in case of error
            // await Seat.releaseLock(
            //   new mongoose.Types.ObjectId(showtimeId),
            //   seatNumber,
            //   row,
            //   new mongoose.Types.ObjectId(customerId)
            // );
            throw error;
        }
    }
    catch (error) {
        console.error("Booking error:", error);
        return res.status(500).json({ message: error.message || "Error booking ticket" });
    }
});
exports.bookTicket = bookTicket;
// Get user's booked tickets
const getUserTickets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const customerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!customerId) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        const tickets = (yield ticket_model_1.default.find({ customer: customerId })
            .populate({
            path: 'showtime',
            populate: [
                { path: 'movieId', select: 'title duration genre posterUrl' },
                { path: 'theaterId', select: 'name location' }
            ]
        })
            .populate('seat', 'seatNumber row')
            .lean());
        res.status(200).json({
            success: true,
            count: tickets.length,
            data: tickets.map(ticket => ({
                ticketId: ticket._id,
                movie: ticket.showtime.movieId,
                theater: ticket.showtime.theaterId,
                showtime: {
                    startTime: ticket.showtime.startTime,
                    endTime: ticket.showtime.endTime
                },
                seat: ticket.seat,
                price: ticket.price,
                status: ticket.status,
                bookingDate: ticket.purchaseDate
            }))
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.getUserTickets = getUserTickets;
// Search movies by title/genre
const searchMovies = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, genre } = req.query;
        const query = {};
        if (title) {
            query.title = { $regex: title, $options: 'i' };
        }
        if (genre) {
            query.genre = { $regex: genre, $options: 'i' };
        }
        const movies = yield movie_model_1.default.find(query).lean();
        res.status(200).json({
            success: true,
            count: movies.length,
            data: movies
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.searchMovies = searchMovies;
// Filter showtimes by date/time
const filterShowtimes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate, time } = req.query;
        const query = {};
        if (startDate || endDate) {
            query.startTime = {};
            if (startDate) {
                query.startTime.$gte = new Date(startDate);
            }
            if (endDate) {
                query.startTime.$lte = new Date(endDate);
            }
        }
        if (time) {
            const [hours, minutes] = time.split(':').map(Number);
            const timeDate = new Date();
            timeDate.setHours(hours, minutes, 0, 0);
            query.startTime = Object.assign(Object.assign({}, query.startTime), { $gte: timeDate });
        }
        const showtimes = yield showtime_model_1.default.find(query)
            .populate('movieId', 'title duration genre posterUrl')
            .populate('theaterId', 'name location')
            .lean();
        res.status(200).json({
            success: true,
            count: showtimes.length,
            data: showtimes
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.filterShowtimes = filterShowtimes;
// Get detailed booking history
const getBookingHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const customerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        console.log("Customer ID from token:", customerId);
        if (!customerId) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        const bookings = yield booking_model_1.default.find({ userId: new mongoose_1.Types.ObjectId(customerId) })
            .populate({
            path: 'showtimeId',
            populate: [
                { path: 'movieId', select: 'title duration genre posterUrl' },
                { path: 'theaterId', select: 'name location' }
            ]
        })
            .populate('seats')
            .sort({ createdAt: -1 })
            .lean();
        console.log("Found bookings:", bookings.length);
        const bookingHistory = bookings.map(booking => {
            var _a, _b, _c, _d, _e, _f, _g;
            // Provide default values for missing data
            const defaultMovie = {
                _id: new mongoose_1.Types.ObjectId(),
                title: 'Movie Information Unavailable',
                duration: 'N/A',
                genre: 'N/A',
                posterUrl: '/placeholder-movie.jpg'
            };
            const defaultTheater = {
                _id: new mongoose_1.Types.ObjectId(),
                name: 'Theater Information Unavailable',
                location: 'N/A'
            };
            const defaultShowtime = {
                startTime: booking.createdAt || new Date(),
                endTime: new Date(((_a = booking.createdAt) === null || _a === void 0 ? void 0 : _a.getTime()) + 7200000) || new Date() // 2 hours after start
            };
            // Parse seat strings into row and seatNumber
            const parsedSeats = ((_b = booking.seats) === null || _b === void 0 ? void 0 : _b.map(seatStr => {
                const row = seatStr.charAt(0);
                const seatNumber = seatStr.slice(1);
                return {
                    row,
                    seatNumber
                };
            })) || [{
                    row: 'N/A',
                    seatNumber: 'N/A'
                }];
            return {
                bookingId: booking._id,
                movie: ((_c = booking.showtimeId) === null || _c === void 0 ? void 0 : _c.movieId) || defaultMovie,
                theater: ((_d = booking.showtimeId) === null || _d === void 0 ? void 0 : _d.theaterId) || defaultTheater,
                showtime: {
                    startTime: ((_e = booking.showtimeId) === null || _e === void 0 ? void 0 : _e.startTime) || defaultShowtime.startTime,
                    endTime: ((_f = booking.showtimeId) === null || _f === void 0 ? void 0 : _f.endTime) || defaultShowtime.endTime
                },
                seats: parsedSeats,
                totalAmount: booking.totalAmount || 0,
                price: ((_g = booking.showtimeId) === null || _g === void 0 ? void 0 : _g.price) || 0,
                bookingDate: booking.createdAt || new Date(),
                status: booking.status || 'UNKNOWN',
                paymentStatus: booking.paymentStatus || 'UNKNOWN'
            };
        });
        res.status(200).json({
            success: true,
            count: bookingHistory.length,
            data: bookingHistory
        });
    }
    catch (err) {
        console.error("Error in getBookingHistory:", err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.getBookingHistory = getBookingHistory;
// Cancel booking
const cancelBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { ticketId } = req.params;
        const customerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!customerId) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        const ticket = yield ticket_model_1.default.findOne({ _id: ticketId, customer: customerId });
        if (!ticket) {
            res.status(404).json({ message: 'Ticket not found' });
            return;
        }
        // Check if showtime is in the future
        const showtime = yield showtime_model_1.default.findById(ticket.showtime);
        if (!showtime) {
            res.status(404).json({ message: 'Showtime not found' });
            return;
        }
        const showtimeDate = new Date(showtime.startTime);
        const currentDate = new Date();
        const hoursUntilShowtime = (showtimeDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60);
        // Only allow cancellation if showtime is more than 2 hours away
        if (hoursUntilShowtime <= 2) {
            res.status(400).json({ message: 'Cannot cancel booking less than 2 hours before showtime' });
            return;
        }
        // Delete the ticket
        yield ticket_model_1.default.findByIdAndDelete(ticketId);
        // Update payment status if exists
        yield payment_model_1.default.findOneAndUpdate({ ticket: ticketId }, { paymentStatus: 'REFUNDED' });
        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully'
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.cancelBooking = cancelBooking;
