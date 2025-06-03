"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const customer_controller_1 = require("../controllers/customer.controller");
const router = express_1.default.Router();
router.get('/profile', auth_middleware_1.verifyToken, customer_controller_1.getProfile);
router.put('/profile', auth_middleware_1.verifyToken, customer_controller_1.updateProfile);
// Add other protected customer routes here
exports.default = router;
