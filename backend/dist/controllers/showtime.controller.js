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
exports.deleteShowtime = exports.getAllShowtimes = exports.addShowtime = void 0;
const showtime_model_1 = __importDefault(require("../model/showtime.model"));
const movie_model_1 = __importDefault(require("../model/movie.model"));
const theater_model_1 = __importDefault(require("../model/theater.model"));
// Add new showtime
const addShowtime = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { movieId, theaterId, startTime, endTime, price } = req.body;
        if (!movieId || !theaterId || !startTime || !endTime || !price) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        // Validate price
        if (price < 0) {
            return res.status(400).json({ message: 'Price cannot be negative' });
        }
        // Check if movie exists
        const movieExists = yield movie_model_1.default.findById(movieId);
        if (!movieExists) {
            return res.status(404).json({ message: 'Movie not found' });
        }
        // Check if theater exists
        const theaterExists = yield theater_model_1.default.findById(theaterId);
        if (!theaterExists) {
            return res.status(404).json({ message: 'Theater not found' });
        }
        // Convert string dates to Date objects
        const startDateTime = new Date(startTime);
        const endDateTime = new Date(endTime);
        // Validate dates
        if (startDateTime >= endDateTime) {
            return res.status(400).json({ message: 'End time must be after start time' });
        }
        // Check for overlapping showtimes in the same theater
        const overlappingShowtime = yield showtime_model_1.default.findOne({
            theaterId,
            $or: [
                {
                    startTime: { $lt: endDateTime },
                    endTime: { $gt: startDateTime }
                }
            ]
        });
        if (overlappingShowtime) {
            return res.status(400).json({
                message: 'Showtime overlaps with existing showtime in this theater',
                existingShowtime: overlappingShowtime
            });
        }
        const showtime = yield showtime_model_1.default.create({
            movieId,
            theaterId,
            startTime: startDateTime,
            endTime: endDateTime,
            price,
            availableSeats: theaterExists.capacity // Set initial available seats to theater capacity
        });
        res.status(201).json({
            success: true,
            data: showtime
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.addShowtime = addShowtime;
// Get all showtimes
const getAllShowtimes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const showtimes = yield showtime_model_1.default.find()
            .populate('movieId', 'title duration genre')
            .populate('theaterId', 'name location');
        // Format the response to include pricing information
        const formattedShowtimes = showtimes.map(showtime => (Object.assign(Object.assign({}, showtime.toObject()), { ticketPrice: showtime.price })));
        res.status(200).json({
            success: true,
            count: showtimes.length,
            data: formattedShowtimes
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.getAllShowtimes = getAllShowtimes;
// Delete showtime
const deleteShowtime = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const showtime = yield showtime_model_1.default.findById(id);
        if (!showtime) {
            return res.status(404).json({ message: 'Showtime not found' });
        }
        yield showtime_model_1.default.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: 'Showtime deleted successfully'
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.deleteShowtime = deleteShowtime;
