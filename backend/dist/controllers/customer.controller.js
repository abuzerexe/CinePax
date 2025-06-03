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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfile = exports.logoutUser = exports.loginUser = exports.signupUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const customer_model_1 = __importDefault(require("../model/customer.model"));
const admin_model_1 = __importDefault(require("../model/admin.model"));
const blacklist_model_1 = __importDefault(require("../model/blacklist.model"));
// Customer Signup (Admin cannot signup)
const signupUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, fullName, phone } = req.body;
        // Check if email is already registered (as customer)
        const existingCustomer = yield customer_model_1.default.findOne({ email });
        if (existingCustomer)
            return res.status(400).json({ message: 'Email already registered' });
        // Hash password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Save customer
        const newCustomer = new customer_model_1.default({ email, password: hashedPassword, fullName, phone });
        yield newCustomer.save();
        res.status(201).json({ message: 'User registered successfully' });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.signupUser = signupUser;
// Unified Login (Admin or Customer)
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        // First, check if credentials match admin
        const admin = yield admin_model_1.default.findOne({ email });
        if (admin) {
            const isValid = yield admin.isPasswordCorrect(password);
            if (!isValid)
                return res.status(401).json({ message: 'Invalid admin credentials' });
            const token = jsonwebtoken_1.default.sign({
                id: admin._id,
                email: admin.email,
                role: 'admin'
            }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '1h' });
            return res.status(200).json({ token, role: 'admin', message: 'Admin login successful' });
        }
        // Otherwise, check if customer
        const customer = yield customer_model_1.default.findOne({ email });
        if (!customer)
            return res.status(400).json({ message: 'Invalid email or password' });
        const isMatch = yield bcrypt_1.default.compare(password, customer.password);
        if (!isMatch)
            return res.status(400).json({ message: 'Invalid email or password' });
        const token = jsonwebtoken_1.default.sign({
            id: customer._id,
            email: customer.email,
            role: 'customer'
        }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '1h' });
        res.status(200).json({ token, role: 'customer', message: 'Login successful' });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.loginUser = loginUser;
// Logout and blacklist token
const logoutUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader)
            return res.status(400).json({ message: 'Authorization token missing' });
        const token = authHeader.split(' ')[1];
        if (!token)
            return res.status(400).json({ message: 'Token missing' });
        const decoded = jsonwebtoken_1.default.decode(token);
        if (!decoded || !decoded.exp) {
            return res.status(400).json({ message: 'Invalid token' });
        }
        const expiresAt = new Date(decoded.exp * 1000);
        yield new blacklist_model_1.default({ token, expiresAt }).save();
        res.status(200).json({ message: 'Logout successful' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.logoutUser = logoutUser;
// Get current user's profile (protected route)
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // First try to find in customers
        const customer = yield customer_model_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a.id).select('-password');
        if (customer) {
            return res.status(200).json(customer);
        }
        // If not found in customers, try admins
        const admin = yield admin_model_1.default.findById((_b = req.user) === null || _b === void 0 ? void 0 : _b.id).select('-password');
        if (admin) {
            return res.status(200).json(admin);
        }
        return res.status(404).json({ message: 'User not found' });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.getProfile = getProfile;
// Update current user's profile (protected route)
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { fullName, email, phone } = req.body;
        // First try to find in customers
        const customer = yield customer_model_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
        if (customer) {
            if (fullName)
                customer.fullName = fullName;
            if (email)
                customer.email = email;
            if (phone)
                customer.phone = phone;
            yield customer.save();
            const customerObj = customer.toObject();
            const { password } = customerObj, customerResponse = __rest(customerObj, ["password"]);
            return res.status(200).json(customerResponse);
        }
        // If not found in customers, try admins
        const admin = yield admin_model_1.default.findById((_b = req.user) === null || _b === void 0 ? void 0 : _b.id);
        if (admin) {
            if (fullName)
                admin.fullName = fullName;
            if (email)
                admin.email = email;
            if (phone)
                admin.phone = phone;
            yield admin.save();
            const adminObj = admin.toObject();
            const { password } = adminObj, adminResponse = __rest(adminObj, ["password"]);
            return res.status(200).json(adminResponse);
        }
        return res.status(404).json({ message: 'User not found' });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});
exports.updateProfile = updateProfile;
