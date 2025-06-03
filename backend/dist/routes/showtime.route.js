"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const showtime_controller_1 = require("../controllers/showtime.controller");
const router = express_1.default.Router();
// Showtime management routes
router.post('/', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, showtime_controller_1.addShowtime);
router.get('/', showtime_controller_1.getAllShowtimes); // Public route
router.delete('/:id', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, showtime_controller_1.deleteShowtime);
exports.default = router;
