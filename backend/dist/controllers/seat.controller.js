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
exports.deleteSeat = exports.getSeatsByShowtime = exports.getAllSeats = exports.addSeat = void 0;
const seat_model_1 = __importDefault(require("../model/seat.model"));
const showtime_model_1 = __importDefault(require("../model/showtime.model"));
// Add new seat
const addSeat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { showtimeId, seatNumber } = req.body;
        if (!showtimeId || !seatNumber) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        // Check if showtime exists
        const showtime = yield showtime_model_1.default.findById(showtimeId);
        if (!showtime) {
            return res.status(404).json({ message: 'Showtime not found' });
        }
        // Check if seat already exists for this showtime
        const existingSeat = yield seat_model_1.default.findOne({
            showtimeId,
            seatNumber
        });
        if (existingSeat) {
            return res.status(400).json({ message: 'Seat already exists for this showtime' });
        }
        const seat = yield seat_model_1.default.create({
            showtimeId,
            seatNumber,
            status: 'available'
        });
        res.status(201).json({
            success: true,
            data: seat
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.addSeat = addSeat;
// Get all seats
const getAllSeats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const seats = yield seat_model_1.default.find().populate('showtimeId', 'movieId theaterId startTime');
        res.status(200).json({
            success: true,
            count: seats.length,
            data: seats
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.getAllSeats = getAllSeats;
// Get seats by showtime
const getSeatsByShowtime = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { showtimeId } = req.params;
        const seats = yield seat_model_1.default.find({ showtimeId });
        res.status(200).json({
            success: true,
            count: seats.length,
            data: seats
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.getSeatsByShowtime = getSeatsByShowtime;
// Delete seat
const deleteSeat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const seat = yield seat_model_1.default.findById(id);
        if (!seat) {
            return res.status(404).json({ message: 'Seat not found' });
        }
        // Delete the seat
        yield seat_model_1.default.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: 'Seat deleted successfully'
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.deleteSeat = deleteSeat;
