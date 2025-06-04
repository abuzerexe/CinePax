"use strict";
// scripts/createAdmin.js
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('../model/admin.model');
mongoose.connect('mongodb://localhost:27017/Cinepax')
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    const exists = yield Admin.findOne({ email: 'admin@example.com' });
    if (!exists) {
        const hashed = yield bcrypt.hash('admin123', 10);
        yield Admin.create({
            fullName: 'Admin',
            email: 'admin@example.com',
            phone: '03001234567',
            password: hashed
        });
        console.log('Admin created successfully');
    }
    else {
        console.log('Admin already exists');
    }
    process.exit();
}))
    .catch(err => {
    console.error('Error:', err);
    process.exit();
});
