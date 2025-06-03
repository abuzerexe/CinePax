"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const staff_controller_1 = require("../controllers/staff.controller");
const router = express_1.default.Router();
// Staff management routes
router.post('/', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, staff_controller_1.addStaff);
router.get('/', staff_controller_1.getAllStaff); // Public route
router.delete('/:id', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, staff_controller_1.deleteStaff);
exports.default = router;
