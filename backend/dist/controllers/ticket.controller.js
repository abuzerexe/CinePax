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
exports.updateTicketStatus = exports.getBookedTicketsByShowtime = exports.getAllBookedTickets = void 0;
const ticket_model_1 = __importDefault(require("../model/ticket.model"));
const showtime_model_1 = __importDefault(require("../model/showtime.model"));
const theater_model_1 = __importDefault(require("../model/theater.model"));
const getAllBookedTickets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tickets = (yield ticket_model_1.default.find()
            .populate({
            path: 'showtime',
            populate: [
                { path: 'movieId', select: 'title duration genre' },
                { path: 'theaterId', select: 'name location capacity' }
            ]
        })
            .populate('customer', 'fullName email phone')
            .populate('seat', 'seatNumber row')
            .lean());
        const theaterStats = {};
        tickets.forEach(ticket => {
            const showtime = ticket.showtime;
            if (showtime && showtime.theaterId) {
                const theaterId = showtime.theaterId._id.toString();
                if (!theaterStats[theaterId]) {
                    theaterStats[theaterId] = {
                        theater: showtime.theaterId,
                        totalSeats: showtime.theaterId.capacity,
                        bookedSeats: 0,
                        availableSeats: showtime.theaterId.capacity
                    };
                }
                theaterStats[theaterId].bookedSeats++;
                theaterStats[theaterId].availableSeats--;
            }
        });
        res.status(200).json({
            success: true,
            count: tickets.length,
            data: tickets.map(ticket => ({
                _id: ticket._id,
                customer: ticket.customer,
                showtime: {
                    _id: ticket.showtime._id,
                    movie: ticket.showtime.movieId,
                    theater: ticket.showtime.theaterId,
                    startTime: ticket.showtime.startTime,
                    endTime: ticket.showtime.endTime,
                    price: ticket.showtime.price
                },
                seat: ticket.seat,
                price: ticket.price,
                status: ticket.status,
                createdAt: ticket.createdAt
            })),
            theaterStats: Object.values(theaterStats)
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.getAllBookedTickets = getAllBookedTickets;
const getBookedTicketsByShowtime = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { showtimeId } = req.params;
        const showtime = yield showtime_model_1.default.findById(showtimeId);
        if (!showtime) {
            return res.status(404).json({ message: 'Showtime not found' });
        }
        const tickets = yield ticket_model_1.default.find({ showtime: showtimeId })
            .populate('customer', 'fullName email phone')
            .populate('seat', 'seatNumber row');
        const theater = yield theater_model_1.default.findById(showtime.theaterId);
        if (!theater) {
            return res.status(404).json({ message: 'Theater not found' });
        }
        const totalSeats = theater.capacity;
        const bookedSeats = tickets.length;
        const availableSeats = totalSeats - bookedSeats;
        res.status(200).json({
            success: true,
            count: tickets.length,
            showtime: {
                movie: showtime.movieId,
                theater: showtime.theaterId,
                startTime: showtime.startTime,
                endTime: showtime.endTime,
                price: showtime.price
            },
            seatStats: {
                totalSeats,
                bookedSeats,
                availableSeats
            },
            data: tickets
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.getBookedTicketsByShowtime = getBookedTicketsByShowtime;
const updateTicketStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ticketId } = req.params;
        const { status } = req.body;
        if (!status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        const ticket = yield ticket_model_1.default.findById(ticketId)
            .populate({
            path: 'showtime',
            select: 'movieId theaterId startTime endTime price',
            populate: [
                {
                    path: 'movieId',
                    select: 'title duration genre',
                    model: 'Movie'
                },
                {
                    path: 'theaterId',
                    select: 'name location capacity',
                    model: 'Theater'
                }
            ]
        })
            .populate('customer', 'fullName email phone')
            .populate('seat', 'seatNumber row');
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }
        const showtime = yield showtime_model_1.default.findById(ticket.showtime._id);
        if (!showtime) {
            return res.status(404).json({ message: 'Showtime not found' });
        }
        const showtimeDate = new Date(showtime.startTime);
        const currentDate = new Date();
        if (showtimeDate < currentDate) {
            return res.status(400).json({ message: 'Cannot update status for past showtimes' });
        }
        ticket.status = status;
        yield ticket.save();
        const populatedTicket = ticket;
        const transformedTicket = {
            _id: populatedTicket._id,
            customer: populatedTicket.customer,
            showtime: {
                _id: populatedTicket.showtime._id,
                movie: populatedTicket.showtime.movieId,
                theater: populatedTicket.showtime.theaterId,
                startTime: populatedTicket.showtime.startTime,
                endTime: populatedTicket.showtime.endTime,
                price: populatedTicket.showtime.price
            },
            seat: populatedTicket.seat,
            price: populatedTicket.price,
            status: populatedTicket.status,
            createdAt: populatedTicket.createdAt
        };
        res.status(200).json({
            success: true,
            data: transformedTicket
        });
    }
    catch (err) {
        console.error('Error updating ticket status:', err);
        res.status(500).json({
            message: 'Server error',
            error: err.message,
            details: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});
exports.updateTicketStatus = updateTicketStatus;
exports.default = {
    getAllBookedTickets: exports.getAllBookedTickets,
    getBookedTicketsByShowtime: exports.getBookedTicketsByShowtime,
    updateTicketStatus: exports.updateTicketStatus
};
