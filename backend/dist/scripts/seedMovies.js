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
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const movie_model_1 = __importDefault(require("../model/movie.model"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Cinepax';
// Read movies from the frontend JSON file
const moviesData = JSON.parse(fs_1.default.readFileSync(path_1.default.join(__dirname, '../../frontend/src/movies.json'), 'utf-8'));
// Helper function to safely parse MongoDB date
const parseMongoDate = (dateObj) => {
    var _a;
    try {
        if ((_a = dateObj === null || dateObj === void 0 ? void 0 : dateObj.$date) === null || _a === void 0 ? void 0 : _a.$numberLong) {
            return new Date(parseInt(dateObj.$date.$numberLong));
        }
        // Fallback to using the year if date parsing fails
        return new Date((dateObj === null || dateObj === void 0 ? void 0 : dateObj.year) || new Date().getFullYear(), 0, 1);
    }
    catch (error) {
        console.warn('Error parsing date, using year as fallback:', error);
        return new Date((dateObj === null || dateObj === void 0 ? void 0 : dateObj.year) || new Date().getFullYear(), 0, 1);
    }
};
// Transform the data to match our model
const movies = moviesData.map((movie) => ({
    title: movie.title || 'Untitled Movie',
    duration: movie.duration || 120, // Default 2 hours
    genre: movie.genre || 'Unknown',
    releaseDate: parseMongoDate(movie.releaseDate),
    image: movie.image || 'https://picsum.photos/800/1200', // Default placeholder image
    description: movie.description || `A ${movie.genre || 'movie'} from ${movie.year || 'unknown year'}.`, // Generate description if missing
    rating: movie.rating || 0,
    year: movie.year || new Date().getFullYear(),
    director: movie.director || "Unknown",
    cast: movie.cast || ["Unknown"]
}));
function seedMovies() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Connect to MongoDB
            yield mongoose_1.default.connect(MONGODB_URI);
            console.log('Connected to MongoDB');
            // Clear existing movies
            yield movie_model_1.default.deleteMany({});
            console.log('Cleared existing movies');
            // Insert new movies
            yield movie_model_1.default.insertMany(movies);
            console.log(`Successfully added ${movies.length} movies`);
        }
        catch (error) {
            console.error('Error seeding movies:', error);
        }
        finally {
            yield mongoose_1.default.disconnect();
            console.log('Disconnected from MongoDB');
        }
    });
}
// Run the seeding function
seedMovies();
