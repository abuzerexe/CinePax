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
exports.updateMovie = exports.getFeaturedMovies = exports.getTheaterShowtimes = exports.getMovieById = exports.deleteMovie = exports.getAllMovies = exports.addMovie = void 0;
const movie_model_1 = __importDefault(require("../model/movie.model"));
const showtime_model_1 = __importDefault(require("../model/showtime.model"));
const ticket_model_1 = __importDefault(require("../model/ticket.model"));
// Add new movie
const addMovie = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, duration, genre, releaseDate, image, description, rating, year } = req.body;
        if (!title || !duration || !genre || !releaseDate || !description || !year) {
            return res.status(400).json({ message: 'All required fields must be provided' });
        }
        const movie = yield movie_model_1.default.create({
            title,
            duration,
            genre,
            releaseDate,
            image: image || `https://picsum.photos/800/1200?random=${Date.now()}`,
            description,
            rating: rating || 0,
            year
        });
        res.status(201).json({
            success: true,
            data: movie
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.addMovie = addMovie;
// Get all movies
const getAllMovies = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const movies = yield movie_model_1.default.find().sort({ releaseDate: -1 });
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
exports.getAllMovies = getAllMovies;
// Delete movie
const deleteMovie = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const movie = yield movie_model_1.default.findById(id);
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }
        yield movie_model_1.default.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: 'Movie deleted successfully'
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.deleteMovie = deleteMovie;
const getMovieById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const movie = yield movie_model_1.default.findById(id).lean();
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }
        // Fetch showtimes for this movie
        const showtimes = yield showtime_model_1.default.find({ movieId: id })
            .populate('theaterId', 'name location capacity')
            .lean();
        // Get seat availability for each showtime
        const showtimesWithAvailability = yield Promise.all(showtimes.map((showtime) => __awaiter(void 0, void 0, void 0, function* () {
            const bookedTickets = yield ticket_model_1.default.find({ showtime: showtime._id });
            const bookedSeats = bookedTickets.map(ticket => ticket.seat);
            const availableSeats = showtime.theaterId.capacity - bookedSeats.length;
            return {
                _id: showtime._id,
                theaterId: {
                    _id: showtime.theaterId._id,
                    name: showtime.theaterId.name,
                    location: showtime.theaterId.location
                },
                startTime: showtime.startTime,
                endTime: showtime.endTime,
                price: showtime.price,
                availableSeats,
                bookedSeats: bookedSeats.length
            };
        })));
        res.json({
            success: true,
            data: Object.assign(Object.assign({}, movie), { showtimes: showtimesWithAvailability })
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching movie', error });
    }
});
exports.getMovieById = getMovieById;
const getTheaterShowtimes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { theaterId } = req.params;
        const showtimes = yield showtime_model_1.default.find({ theaterId })
            .populate('movieId', 'title duration image')
            .sort({ startTime: 1 });
        res.json(showtimes);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching showtimes', error });
    }
});
exports.getTheaterShowtimes = getTheaterShowtimes;
// Get featured movies (most recent with highest ratings)
const getFeaturedMovies = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // const movies = await Movie.find()
        //   .sort({ releaseDate: -1, rating: -1 })
        //   .limit(6);
        const movieIds = [
            '68372e07a568b96229dab65f',
            '68372e07a568b96229dab6a0',
            '68372e07a568b96229dab6a5',
            '68372e07a568b96229dab67e',
            '68372e07a568b96229dab69b',
            '68372e07a568b96229dab6b5'
        ];
        const movies = yield movie_model_1.default.find({
            _id: { $in: movieIds }
        });
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
exports.getFeaturedMovies = getFeaturedMovies;
// Update movie
const updateMovie = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { title, duration, genre, releaseDate, image, description, rating, year } = req.body;
        if (!title || !duration || !genre || !releaseDate || !description || !year) {
            return res.status(400).json({ message: 'All required fields must be provided' });
        }
        const movie = yield movie_model_1.default.findByIdAndUpdate(id, {
            title,
            duration,
            genre,
            releaseDate,
            image: image || `https://picsum.photos/800/1200?random=${Date.now()}`,
            description,
            rating: rating || 0,
            year
        }, { new: true });
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }
        res.status(200).json({
            success: true,
            data: movie
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.updateMovie = updateMovie;
