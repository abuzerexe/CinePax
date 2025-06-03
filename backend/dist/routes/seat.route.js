"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const seat_controller_1 = require("../controllers/seat.controller");
const router = express_1.default.Router();
// Seat management routes
router.post('/', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, seat_controller_1.addSeat);
router.get('/', seat_controller_1.getAllSeats); // Public route
router.delete('/:id', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, seat_controller_1.deleteSeat);
exports.default = router;
