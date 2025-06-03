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
exports.deleteStaff = exports.getAllStaff = exports.addStaff = void 0;
const staff_model_1 = __importDefault(require("../model/staff.model"));
const theater_model_1 = __importDefault(require("../model/theater.model"));
// Add new staff
const addStaff = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { theater, firstName, lastName, role } = req.body;
        if (!theater || !firstName || !lastName || !role) {
            res.status(400).json({ message: 'All fields are required' });
            return;
        }
        // Check if theater exists
        const theaterExists = yield theater_model_1.default.findById(theater);
        if (!theaterExists) {
            res.status(404).json({ message: 'Theater not found' });
            return;
        }
        const staff = yield staff_model_1.default.create({
            theater,
            firstName,
            lastName,
            role
        });
        res.status(201).json({
            success: true,
            data: staff
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.addStaff = addStaff;
// Get all staff
const getAllStaff = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const staff = yield staff_model_1.default.find().lean();
        res.status(200).json({
            success: true,
            count: staff.length,
            data: staff
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.getAllStaff = getAllStaff;
// Delete staff
const deleteStaff = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const staff = yield staff_model_1.default.findByIdAndDelete(req.params.id);
        if (!staff) {
            res.status(404).json({ message: 'Staff not found' });
            return;
        }
        res.status(200).json({ success: true, message: 'Staff deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.deleteStaff = deleteStaff;
