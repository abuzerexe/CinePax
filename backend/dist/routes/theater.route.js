"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const theater_controller_1 = require("../controllers/theater.controller");
const router = express_1.default.Router();
// Theater management routes
router.post('/', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, theater_controller_1.addTheater);
router.get('/', theater_controller_1.getAllTheaters);
router.get('/:id', theater_controller_1.getTheaterById);
router.get('/:id/showtimes', theater_controller_1.getTheaterShowtimes);
router.put('/:id', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, theater_controller_1.updateTheater);
router.delete('/:id', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, theater_controller_1.deleteTheater);
exports.default = router;
