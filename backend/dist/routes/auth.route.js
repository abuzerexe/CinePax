"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const customer_controller_1 = require("../controllers/customer.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Public routes
router.post('/signup', customer_controller_1.signupUser);
router.post('/signin', customer_controller_1.loginUser);
// Protected routes
router.post('/logout', auth_middleware_1.verifyToken, customer_controller_1.logoutUser);
exports.default = router;
