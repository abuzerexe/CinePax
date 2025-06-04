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
const theater_model_1 = __importDefault(require("../model/theater.model"));
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Cinepax';
const theaters = [
    {
        name: "CinePax IMAX",
        location: "Downtown Mall, 123 Main St",
        capacity: 300,
        amenities: ["IMAX", "Dolby Atmos", "Premium Seating"],
        screens: 5
    },
    {
        name: "CinePax Premium",
        location: "Westside Plaza, 456 Oak Ave",
        capacity: 250,
        amenities: ["Dolby Atmos", "Premium Seating", "Food Service"],
        screens: 4
    },
    {
        name: "CinePax Express",
        location: "Eastside Center, 789 Pine Rd",
        capacity: 200,
        amenities: ["Standard Seating", "Snack Bar"],
        screens: 3
    },
    {
        name: "CinePax Family",
        location: "Northside Mall, 321 Elm St",
        capacity: 280,
        amenities: ["Family Seating", "Play Area", "Snack Bar"],
        screens: 4
    },
    {
        name: "CinePax VIP",
        location: "Southside Complex, 654 Maple Dr",
        capacity: 150,
        amenities: ["VIP Seating", "Lounge", "Premium Food Service"],
        screens: 3
    }
];
function seedTheaters() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Connect to MongoDB
            yield mongoose_1.default.connect(MONGODB_URI);
            console.log('Connected to MongoDB');
            // Clear existing theaters
            yield theater_model_1.default.deleteMany({});
            console.log('Cleared existing theaters');
            // Insert new theaters
            yield theater_model_1.default.insertMany(theaters);
            console.log(`Successfully added ${theaters.length} theaters`);
        }
        catch (error) {
            console.error('Error seeding theaters:', error);
        }
        finally {
            yield mongoose_1.default.disconnect();
            console.log('Disconnected from MongoDB');
        }
    });
}
// Run the seeding function
seedTheaters();
