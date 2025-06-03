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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
// Import models
const theater_model_1 = __importDefault(require("../model/theater.model"));
const showtime_model_1 = __importDefault(require("../model/showtime.model"));
const seat_model_1 = __importDefault(require("../model/seat.model"));
const booking_model_1 = __importDefault(require("../model/booking.model"));
// Load environment variables
dotenv_1.default.config();
// Read sample data
const sampleData = JSON.parse(fs_1.default.readFileSync(path_1.default.join(__dirname, '../data/sample-data.json'), 'utf8'));
// Connect to MongoDB
mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Cinepax')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});
// Import data
function importData() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Clear existing data
            yield Promise.all([
                theater_model_1.default.deleteMany({}),
                showtime_model_1.default.deleteMany({}),
                seat_model_1.default.deleteMany({}),
                booking_model_1.default.deleteMany({})
            ]);
            // Import theaters
            const theaters = yield theater_model_1.default.insertMany(sampleData.theaters);
            console.log('Theaters imported:', theaters.length);
            // Import showtimes
            const showtimes = yield showtime_model_1.default.insertMany(sampleData.showtimes);
            console.log('Showtimes imported:', showtimes.length);
            // Import seats
            const seats = yield seat_model_1.default.insertMany(sampleData.seats);
            console.log('Seats imported:', seats.length);
            // Import bookings
            const bookings = yield booking_model_1.default.insertMany(sampleData.bookings);
            console.log('Bookings imported:', bookings.length);
            console.log('Sample data imported successfully!');
            process.exit(0);
        }
        catch (error) {
            console.error('Error importing data:', error);
            process.exit(1);
        }
    });
}
importData();
