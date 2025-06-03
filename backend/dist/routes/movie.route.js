"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const movie_controller_1 = require("../controllers/movie.controller");
const router = express_1.default.Router();
// Movie management routes
router.post('/', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, movie_controller_1.addMovie);
router.get('/', movie_controller_1.getAllMovies); // Public route
router.get('/featured', movie_controller_1.getFeaturedMovies);
router.get('/theater/:theaterId/showtimes', auth_middleware_1.verifyToken, movie_controller_1.getTheaterShowtimes);
router.get('/:id', movie_controller_1.getMovieById);
router.put('/:id', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, movie_controller_1.updateMovie);
router.delete('/:id', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, movie_controller_1.deleteMovie);
exports.default = router;
