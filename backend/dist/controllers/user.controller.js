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
const getAllMoviesWithShowtimes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const skip = (page - 1) * limit;
        const total = yield movie_model_1.default.countDocuments();
        const movies = yield movie_model_1.default.find()
            .skip(skip)
            .limit(limit)
            .lean();
        const allMovies = yield movie_model_1.default.find().select('genre year').lean();
        const genres = [...new Set(allMovies.map(movie => movie.genre))].sort();
        const years = [...new Set(allMovies.map(movie => movie.year))].sort((a, b) => b - a);
        const showtimes = yield showtime_model_1.default.find()
            .populate('movieId', 'title description duration genre releaseDate image')
            .populate('theaterId', 'name location capacity')
            .lean();
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
            data: moviesWithShowtimes,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            filters: {
                genres,
                years
            }
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.getAllMoviesWithShowtimes = getAllMoviesWithShowtimes;
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
        const showtimesWithAvailability = yield Promise.all(showtimes.map((showtime) => __awaiter(void 0, void 0, void 0, function* () {
            const bookedTickets = yield ticket_model_1.default.find({
                showtime: showtime._id,
                status: { $ne: 'cancelled' }
            });
            const bookedSeats = bookedTickets.length;
            const availableSeats = showtime.theaterId.capacity - bookedSeats;
            return {
                id: showtime._id,
                theater: showtime.theaterId,
                startTime: showtime.startTime,
                endTime: showtime.endTime,
                price: showtime.price,
                availableSeats,
                bookedSeats
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
const getShowtimeDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { showtimeId } = req.params;
        const showtime = yield showtime_model_1.default.findById(showtimeId)
            .populate('movieId', 'title description duration genre releaseDate image')
            .populate('theaterId', 'name location capacity')
            .lean();
        if (!showtime) {
            res.status(404).json({ message: 'Showtime not found' });
            return;
        }
        const bookedTickets = yield ticket_model_1.default.find({
            showtime: showtimeId,
            status: { $ne: 'cancelled' }
        })
            .populate('seat', 'seatNumber row')
            .lean();
        const bookedSeats = bookedTickets.map(ticket => {
            const seat = ticket.seat;
            return {
                seatNumber: seat.seatNumber,
                row: seat.row,
                seatId: `${seat.row}${seat.seatNumber}`,
                name: `Seat ${seat.row}${seat.seatNumber}`
            };
        });
        const availableSeats = showtime.theaterId.capacity - bookedSeats.length;
        res.status(200).json({
            success: true,
            data: Object.assign(Object.assign({}, showtime), { availableSeats, bookedSeats: bookedSeats.length, seatAvailability: {
                    total: showtime.theaterId.capacity,
                    available: availableSeats,
                    booked: bookedSeats.length
                }, bookedSeatsList: bookedSeats })
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.getShowtimeDetails = getShowtimeDetails;
const bookTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { showtimeId, seatNumber, row } = req.body;
        const customerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!customerId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const showtime = yield showtime_model_1.default.findById(showtimeId);
        if (!showtime) {
            return res.status(404).json({ message: "Showtime not found" });
        }
        try {
            const existingTicket = yield ticket_model_1.default.findOne({
                showtime: showtimeId,
                'seat.seatNumber': seatNumber,
                'seat.row': row,
                status: { $ne: 'cancelled' }
            });
            if (existingTicket) {
                return res.status(400).json({ message: "Seat is already booked" });
            }
            let seat = yield seat_model_1.default.findOne({
                showtimeId,
                seatNumber,
                row
            });
            if (!seat) {
                seat = yield seat_model_1.default.create({
                    showtimeId,
                    seatNumber,
                    row,
                    status: 'BOOKED',
                    version: 0
                });
            }
            else {
                seat.status = 'BOOKED';
                seat.version += 1;
                yield seat.save();
            }
            const ticket = yield ticket_model_1.default.create({
                showtime: showtimeId,
                customer: customerId,
                seat: seat._id,
                price: showtime.price,
                status: 'confirmed'
            });
            const payment = yield payment_model_1.default.create({
                ticket: ticket._id,
                amount: showtime.price,
                paymentMethod: 'ONLINE',
                paymentStatus: 'COMPLETED'
            });
            const booking = yield booking_model_1.default.create({
                userId: customerId,
                showtimeId,
                seats: [`${row}${seatNumber}`],
                totalAmount: showtime.price,
                status: 'confirmed',
                paymentStatus: 'paid',
                ticket: ticket._id,
                payment: payment._id
            });
            showtime.availableSeats -= 1;
            yield showtime.save();
            return res.status(201).json({
                success: true,
                message: "Ticket booked successfully",
                data: {
                    ticket: {
                        _id: ticket._id,
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
                        _id: payment._id,
                        ticket: ticket._id,
                        amount: showtime.price,
                        paymentMethod: 'ONLINE',
                        paymentStatus: 'COMPLETED',
                        paymentDate: new Date()
                    },
                    booking: {
                        _id: booking._id,
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
            throw error;
        }
    }
    catch (error) {
        console.error("Booking error:", error);
        return res.status(500).json({ message: error.message || "Error booking ticket" });
    }
});
exports.bookTicket = bookTicket;
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
                { path: 'movieId', select: 'title duration genre image' },
                { path: 'theaterId', select: 'name location' }
            ]
        })
            .populate('seat', 'seatNumber row')
            .lean());
        res.status(200).json({
            success: true,
            count: tickets.length,
            data: tickets.map(ticket => ({
                bookingId: ticket._id,
                movie: {
                    _id: ticket.showtime.movieId._id,
                    title: ticket.showtime.movieId.title,
                    duration: ticket.showtime.movieId.duration,
                    genre: ticket.showtime.movieId.genre,
                    image: ticket.showtime.movieId.image
                },
                theater: ticket.showtime.theaterId,
                showtime: {
                    startTime: ticket.showtime.startTime,
                    endTime: ticket.showtime.endTime
                },
                seats: [ticket.seat],
                totalAmount: ticket.price,
                price: ticket.price,
                bookingDate: ticket.purchaseDate,
                status: ticket.status,
                paymentStatus: 'paid'
            }))
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.getUserTickets = getUserTickets;
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
            .populate('movieId', 'title duration genre image')
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
const getBookingHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const customerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!customerId) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        const bookings = yield booking_model_1.default.find({ userId: new mongoose_1.Types.ObjectId(customerId) })
            .populate({
            path: 'showtimeId',
            populate: [
                { path: 'movieId', select: 'title duration genre image' },
                { path: 'theaterId', select: 'name location' }
            ]
        })
            .populate('seats')
            .sort({ createdAt: -1 })
            .lean();
        const bookingHistory = bookings.map(booking => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
            const defaultMovie = {
                _id: new mongoose_1.Types.ObjectId(),
                title: 'Movie Information Unavailable',
                duration: 'N/A',
                genre: 'N/A',
                image: '/placeholder-movie.jpg'
            };
            const defaultTheater = {
                _id: new mongoose_1.Types.ObjectId(),
                name: 'Theater Information Unavailable',
                location: 'N/A'
            };
            const defaultShowtime = {
                startTime: booking.createdAt || new Date(),
                endTime: new Date(((_a = booking.createdAt) === null || _a === void 0 ? void 0 : _a.getTime()) + 7200000) || new Date()
            };
            const parsedSeats = ((_b = booking.seats) === null || _b === void 0 ? void 0 : _b.map(seatStr => {
                if (typeof seatStr === 'string') {
                    const row = seatStr.charAt(0);
                    const seatNumber = seatStr.slice(1);
                    return {
                        row,
                        seatNumber
                    };
                }
                return {
                    row: 'N/A',
                    seatNumber: 'N/A'
                };
            })) || [{
                    row: 'N/A',
                    seatNumber: 'N/A'
                }];
            return {
                _id: booking._id,
                movie: {
                    _id: ((_d = (_c = booking.showtimeId) === null || _c === void 0 ? void 0 : _c.movieId) === null || _d === void 0 ? void 0 : _d._id) || defaultMovie._id,
                    title: ((_f = (_e = booking.showtimeId) === null || _e === void 0 ? void 0 : _e.movieId) === null || _f === void 0 ? void 0 : _f.title) || defaultMovie.title,
                    duration: ((_h = (_g = booking.showtimeId) === null || _g === void 0 ? void 0 : _g.movieId) === null || _h === void 0 ? void 0 : _h.duration) || defaultMovie.duration,
                    genre: ((_k = (_j = booking.showtimeId) === null || _j === void 0 ? void 0 : _j.movieId) === null || _k === void 0 ? void 0 : _k.genre) || defaultMovie.genre,
                    image: ((_m = (_l = booking.showtimeId) === null || _l === void 0 ? void 0 : _l.movieId) === null || _m === void 0 ? void 0 : _m.image) || defaultMovie.image
                },
                showtime: {
                    startTime: ((_o = booking.showtimeId) === null || _o === void 0 ? void 0 : _o.startTime) || defaultShowtime.startTime,
                    theater: ((_q = (_p = booking.showtimeId) === null || _p === void 0 ? void 0 : _p.theaterId) === null || _q === void 0 ? void 0 : _q.name) || 'N/A',
                    location: ((_s = (_r = booking.showtimeId) === null || _r === void 0 ? void 0 : _r.theaterId) === null || _s === void 0 ? void 0 : _s.location) || 'N/A'
                },
                seats: parsedSeats,
                totalAmount: booking.totalAmount || 0,
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
const cancelBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { ticketId } = req.params;
        const customerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { status } = req.body;
        if (!customerId) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        const booking = yield booking_model_1.default.findOne({ _id: ticketId, userId: customerId });
        if (!booking) {
            res.status(404).json({ message: 'Booking not found' });
            return;
        }
        const ticket = yield ticket_model_1.default.findById(booking.ticket).populate('seat');
        if (!ticket) {
            res.status(404).json({ message: 'Ticket not found' });
            return;
        }
        const showtime = yield showtime_model_1.default.findById(ticket.showtime);
        if (!showtime) {
            res.status(404).json({ message: 'Showtime not found' });
            return;
        }
        const showtimeDate = new Date(showtime.startTime);
        const currentDate = new Date();
        const hoursUntilShowtime = (showtimeDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60);
        if (hoursUntilShowtime <= 2) {
            res.status(400).json({ message: 'Cannot cancel booking less than 2 hours before showtime' });
            return;
        }
        if (req.method === 'PUT' && status) {
            ticket.status = status;
            yield ticket.save();
            yield payment_model_1.default.findOneAndUpdate({ ticket: ticket._id }, { paymentStatus: 'REFUNDED' });
            booking.status = 'cancelled';
            booking.paymentStatus = 'refunded';
            yield booking.save();
        }
        else {
            yield ticket_model_1.default.findByIdAndDelete(ticket._id);
            yield payment_model_1.default.findOneAndUpdate({ ticket: ticket._id }, { paymentStatus: 'REFUNDED' });
            booking.status = 'cancelled';
            booking.paymentStatus = 'refunded';
            yield booking.save();
        }
        if (ticket.seat) {
            yield seat_model_1.default.findByIdAndUpdate(ticket.seat._id, {
                status: 'AVAILABLE',
                $unset: { lockExpiresAt: 1, lockedBy: 1 }
            });
        }
        showtime.availableSeats += 1;
        yield showtime.save();
        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully'
        });
    }
    catch (err) {
        console.error('Error cancelling booking:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.cancelBooking = cancelBooking;
