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
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getAllUsers = void 0;
const customer_model_1 = __importDefault(require("../models/customer.model"));
const admin_model_1 = __importDefault(require("../models/admin.model"));
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customers = yield customer_model_1.default.find().select('-password');
        const admins = yield admin_model_1.default.find().select('-password');
        const users = [
            ...customers.map((c) => (Object.assign(Object.assign({}, c.toObject()), { role: 'customer' }))),
            ...admins.map((a) => (Object.assign(Object.assign({}, a.toObject()), { role: 'admin' })))
        ];
        res.status(200).json({
            success: true,
            data: users
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: errorMessage
        });
    }
});
exports.getAllUsers = getAllUsers;
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const customer = yield customer_model_1.default.findById(id).select('-password');
        if (customer) {
            const customerObj = customer.toObject();
            return res.status(200).json({
                success: true,
                data: Object.assign(Object.assign({}, customerObj), { role: 'customer' })
            });
        }
        const admin = yield admin_model_1.default.findById(id).select('-password');
        if (admin) {
            const adminObj = admin.toObject();
            return res.status(200).json({
                success: true,
                data: Object.assign(Object.assign({}, adminObj), { role: 'admin' })
            });
        }
        res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        res.status(500).json({
            success: false,
            message: 'Error fetching user',
            error: errorMessage
        });
    }
});
exports.getUserById = getUserById;
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, fullName, role, phone } = req.body;
        const existingCustomer = yield customer_model_1.default.findOne({ email });
        const existingAdmin = yield admin_model_1.default.findOne({ email });
        if (existingCustomer || existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }
        let user;
        if (role === 'admin') {
            user = yield admin_model_1.default.create({
                email,
                password,
                fullName,
                phone
            });
        }
        else {
            user = yield customer_model_1.default.create({
                email,
                password,
                fullName,
                phone
            });
        }
        const userObj = user.toObject();
        const { password: _ } = userObj, userResponse = __rest(userObj, ["password"]);
        res.status(201).json({
            success: true,
            data: Object.assign(Object.assign({}, userResponse), { role })
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        res.status(500).json({
            success: false,
            message: 'Error creating user',
            error: errorMessage
        });
    }
});
exports.createUser = createUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { fullName, email, phone, role } = req.body;
        const customer = yield customer_model_1.default.findById(id);
        if (customer) {
            customer.fullName = fullName || customer.fullName;
            customer.email = email || customer.email;
            customer.phone = phone || customer.phone;
            yield customer.save();
            const customerObj = customer.toObject();
            const { password: _ } = customerObj, customerResponse = __rest(customerObj, ["password"]);
            return res.status(200).json({
                success: true,
                data: Object.assign(Object.assign({}, customerResponse), { role: 'customer' })
            });
        }
        const admin = yield admin_model_1.default.findById(id);
        if (admin) {
            admin.fullName = fullName || admin.fullName;
            admin.email = email || admin.email;
            admin.phone = phone || admin.phone;
            yield admin.save();
            const adminObj = admin.toObject();
            const { password: _ } = adminObj, adminResponse = __rest(adminObj, ["password"]);
            return res.status(200).json({
                success: true,
                data: Object.assign(Object.assign({}, adminResponse), { role: 'admin' })
            });
        }
        res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        res.status(500).json({
            success: false,
            message: 'Error updating user',
            error: errorMessage
        });
    }
});
exports.updateUser = updateUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deletedCustomer = yield customer_model_1.default.findByIdAndDelete(id);
        if (deletedCustomer) {
            return res.status(200).json({
                success: true,
                message: 'User deleted successfully'
            });
        }
        const deletedAdmin = yield admin_model_1.default.findByIdAndDelete(id);
        if (deletedAdmin) {
            return res.status(200).json({
                success: true,
                message: 'User deleted successfully'
            });
        }
        res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: errorMessage
        });
    }
});
exports.deleteUser = deleteUser;
