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
const updateTheaterCapacity = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cinepax');
        console.log('Connected to MongoDB');
        // Update all theaters to have 80 seats (8 rows x 10 seats)
        const result = yield theater_model_1.default.updateMany({}, { capacity: 80 });
        console.log(`Updated ${result.modifiedCount} theaters`);
        // Verify the update
        const theaters = yield theater_model_1.default.find({});
        console.log('Updated theater capacities:');
        theaters.forEach(theater => {
            console.log(`${theater.name}: ${theater.capacity} seats`);
        });
    }
    catch (error) {
        console.error('Error updating theater capacities:', error);
    }
    finally {
        yield mongoose_1.default.disconnect();
        console.log('Disconnected from MongoDB');
    }
});
updateTheaterCapacity();
