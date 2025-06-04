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
exports.getPaymentsByDateRange = exports.getAllPayments = void 0;
const payment_model_1 = __importDefault(require("../model/payment.model"));
const getAllPayments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payments = yield payment_model_1.default.find()
            .populate({
            path: 'ticket',
            populate: [
                {
                    path: 'showtime',
                    populate: [
                        { path: 'movie', select: 'title' },
                        { path: 'theater', select: 'name location' }
                    ]
                },
                { path: 'customer', select: 'fullName email phone' },
                { path: 'seat', select: 'seatNumber row' }
            ]
        });
        const stats = {
            total: payments.length,
            totalAmount: 0,
            byPaymentMethod: {
                CASH: { count: 0, amount: 0 },
                CARD: { count: 0, amount: 0 },
                ONLINE: { count: 0, amount: 0 }
            },
            byStatus: {
                PENDING: { count: 0, amount: 0 },
                COMPLETED: { count: 0, amount: 0 },
                FAILED: { count: 0, amount: 0 }
            }
        };
        payments.forEach((payment) => {
            const amount = payment.ticket.price;
            stats.totalAmount += amount;
            stats.byPaymentMethod[payment.paymentMethod].count++;
            stats.byPaymentMethod[payment.paymentMethod].amount += amount;
            stats.byStatus[payment.paymentStatus].count++;
            stats.byStatus[payment.paymentStatus].amount += amount;
        });
        res.status(200).json({
            success: true,
            count: payments.length,
            stats,
            data: payments
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.getAllPayments = getAllPayments;
const getPaymentsByDateRange = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            res.status(400).json({ message: 'Start date and end date are required' });
            return;
        }
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            res.status(400).json({ message: 'Invalid date format' });
            return;
        }
        const payments = yield payment_model_1.default.find({
            paymentDate: {
                $gte: start,
                $lte: end
            }
        }).populate({
            path: 'ticket',
            populate: [
                {
                    path: 'showtime',
                    populate: [
                        { path: 'movie', select: 'title' },
                        { path: 'theater', select: 'name location' }
                    ]
                },
                { path: 'customer', select: 'fullName email phone' },
                { path: 'seat', select: 'seatNumber row' }
            ]
        });
        const stats = {
            total: payments.length,
            totalAmount: 0,
            byPaymentMethod: {
                CASH: { count: 0, amount: 0 },
                CARD: { count: 0, amount: 0 },
                ONLINE: { count: 0, amount: 0 }
            },
            byStatus: {
                PENDING: { count: 0, amount: 0 },
                COMPLETED: { count: 0, amount: 0 },
                FAILED: { count: 0, amount: 0 }
            }
        };
        payments.forEach((payment) => {
            const amount = payment.ticket.price;
            stats.totalAmount += amount;
            stats.byPaymentMethod[payment.paymentMethod].count++;
            stats.byPaymentMethod[payment.paymentMethod].amount += amount;
            stats.byStatus[payment.paymentStatus].count++;
            stats.byStatus[payment.paymentStatus].amount += amount;
        });
        res.status(200).json({
            success: true,
            count: payments.length,
            dateRange: {
                start: start,
                end: end
            },
            stats,
            data: payments
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.getPaymentsByDateRange = getPaymentsByDateRange;
