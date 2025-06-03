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
const theater_model_1 = __importDefault(require("../model/theater.model"));
const showtime_model_1 = __importDefault(require("../model/showtime.model"));
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Cinepax';
// Helper function to add hours to a date
const addHours = (date, hours) => {
    return new Date(date.getTime() + hours * 60 * 60 * 1000);
};
// Helper function to generate random price between min and max
const getRandomPrice = (min, max) => {
    return Number((Math.random() * (max - min) + min).toFixed(2));
};
// Helper function to get price based on time of day
const getPriceForTime = (hour) => {
    if (hour < 12) { // Morning shows
        return getRandomPrice(8, 12);
    }
    else if (hour < 17) { // Afternoon shows
        return getRandomPrice(10, 15);
    }
    else { // Evening shows
        return getRandomPrice(15, 25);
    }
};
function seedShowtimes() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Connect to MongoDB
            yield mongoose_1.default.connect(MONGODB_URI);
            console.log('Connected to MongoDB');
            // Get all movies and theaters
            const movies = yield movie_model_1.default.find();
            const theaters = yield theater_model_1.default.find();
            if (movies.length === 0 || theaters.length === 0) {
                console.log('No movies or theaters found. Please seed them first.');
                return;
            }
            // Clear existing showtimes
            yield showtime_model_1.default.deleteMany({});
            console.log('Cleared existing showtimes');
            // Generate showtimes for the next 7 days
            const showtimes = [];
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            // Define showtime slots
            const morningSlots = [10, 11];
            const afternoonSlots = [13, 15, 17];
            const eveningSlots = [19, 20, 21];
            for (let day = 0; day < 7; day++) {
                const currentDate = addHours(today, day * 24);
                // For each theater
                for (const theater of theaters) {
                    // For each movie
                    for (const movie of movies) {
                        // Generate showtimes for different times of day
                        const allSlots = [...morningSlots, ...afternoonSlots, ...eveningSlots];
                        // Randomly select 4-6 slots for each movie
                        const selectedSlots = allSlots
                            .sort(() => Math.random() - 0.5)
                            .slice(0, Math.floor(Math.random() * 3) + 4); // 4-6 slots
                        for (const hour of selectedSlots) {
                            const startTime = new Date(currentDate);
                            startTime.setHours(hour, 0, 0, 0);
                            // End time based on movie duration (assuming duration is in minutes)
                            const endTime = addHours(startTime, Math.ceil(movie.duration / 60));
                            // Price based on time of day
                            const price = getPriceForTime(hour);
                            showtimes.push({
                                movieId: movie._id,
                                theaterId: theater._id,
                                startTime,
                                endTime,
                                price,
                                availableSeats: theater.capacity
                            });
                        }
                    }
                }
            }
            // Insert all showtimes
            yield showtime_model_1.default.insertMany(showtimes);
            console.log(`Successfully added ${showtimes.length} showtimes`);
        }
        catch (error) {
            console.error('Error seeding showtimes:', error);
        }
        finally {
            yield mongoose_1.default.disconnect();
            console.log('Disconnected from MongoDB');
        }
    });
}
// Run the seeding function
seedShowtimes();
