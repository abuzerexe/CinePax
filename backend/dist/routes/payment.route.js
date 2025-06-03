"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const payment_controller_1 = require("../controllers/payment.controller");
const router = express_1.default.Router();
// Payment management routes (admin only)
router.get('/', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, payment_controller_1.getAllPayments);
router.get('/date-range', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, payment_controller_1.getPaymentsByDateRange);
exports.default = router;
