"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const ticket_controller_1 = require("../controllers/ticket.controller");
const router = express_1.default.Router();
router.get('/', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, ticket_controller_1.getAllBookedTickets);
router.get('/showtime/:showtimeId', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, ticket_controller_1.getBookedTicketsByShowtime);
router.put('/:ticketId/status', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, ticket_controller_1.updateTicketStatus);
exports.default = router;
