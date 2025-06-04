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
const dotenv_1 = __importDefault(require("dotenv"));
const connect_1 = __importDefault(require("../connect"));
const seat_model_1 = __importDefault(require("../model/seat.model"));
const showtime_model_1 = __importDefault(require("../model/showtime.model"));
const mongoose_1 = __importDefault(require("mongoose"));
dotenv_1.default.config();
// Helper function to randomly mark some seats as booked (20-30% of seats)
const getRandomSeatStatus = () => {
    return Math.random() < 0.25 ? 'BOOKED' : 'AVAILABLE';
};
const generateSeats = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, connect_1.default)(process.env.MONGO_URI);
        console.log('Connected to database');
        // Get all showtimes
        const showtimes = yield showtime_model_1.default.find();
        console.log(`Found ${showtimes.length} showtimes`);
        for (const showtime of showtimes) {
            // Generate seats for each showtime
            // Theater layout: 5 rows (A-E) with 10 seats each
            const rows = ['A', 'B', 'C', 'D', 'E'];
            const seatsPerRow = 10;
            const seats = [];
            for (const row of rows) {
                for (let number = 1; number <= seatsPerRow; number++) {
                    seats.push({
                        showtimeId: showtime._id,
                        row,
                        seatNumber: `${row}${number.toString().padStart(2, '0')}`, // Format: A01, A02, etc.
                        status: getRandomSeatStatus()
                    });
                }
            }
            // Delete existing seats for this showtime
            yield seat_model_1.default.deleteMany({ showtimeId: showtime._id });
            console.log(`Deleted existing seats for showtime ${showtime._id}`);
            // Insert new seats
            yield seat_model_1.default.insertMany(seats);
            // Count booked seats
            const bookedSeats = seats.filter(seat => seat.status === 'BOOKED').length;
            console.log(`Created ${seats.length} seats for showtime ${showtime._id} (${bookedSeats} booked)`);
        }
        console.log('Seat generation completed');
    }
    catch (error) {
        console.error('Error generating seats:', error);
    }
    finally {
        // Always disconnect from the database
        yield mongoose_1.default.disconnect();
        console.log('Disconnected from database');
        process.exit(0);
    }
});
// Run the script once
generateSeats();
