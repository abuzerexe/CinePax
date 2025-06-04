"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const seatSchema = new mongoose_1.Schema({
    showtimeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Showtime',
        required: true
    },
    seatNumber: {
        type: String,
        required: true
    },
    row: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['AVAILABLE', 'BOOKED', 'RESERVED'],
        default: 'AVAILABLE'
    },
    version: {
        type: Number,
        default: 0
    },
    lockExpiresAt: {
        type: Date
    },
    lockedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Customer'
    }
}, {
    timestamps: true
});
seatSchema.index({ showtimeId: 1, seatNumber: 1, row: 1 }, { unique: true });
seatSchema.pre('save', function (next) {
    this.version += 1;
    next();
});
seatSchema.statics.acquireLock = function (showtimeId_1, seatNumber_1, row_1, userId_1) {
    return __awaiter(this, arguments, void 0, function* (showtimeId, seatNumber, row, userId, lockDuration = 15 * 60 * 1000 // 15 minutes default
    ) {
        const now = new Date();
        const lockExpiresAt = new Date(now.getTime() + lockDuration);
        const seat = yield this.findOneAndUpdate({
            showtimeId,
            seatNumber,
            row,
            $or: [
                { lockExpiresAt: { $lt: now } },
                { lockExpiresAt: { $exists: false } }
            ]
        }, {
            $set: {
                lockExpiresAt,
                lockedBy: userId
            }
        }, { new: true });
        return seat;
    });
};
seatSchema.statics.releaseLock = function (showtimeId, seatNumber, row, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        return this.findOneAndUpdate({
            showtimeId,
            seatNumber,
            row,
            lockedBy: userId
        }, {
            $unset: {
                lockExpiresAt: 1,
                lockedBy: 1
            }
        }, { new: true });
    });
};
seatSchema.statics.updateWithVersion = function (id, update, version) {
    return __awaiter(this, void 0, void 0, function* () {
        return this.findOneAndUpdate({
            _id: id,
            version: version
        }, {
            $set: update,
            $inc: { version: 1 }
        }, { new: true });
    });
};
const Seat = mongoose_1.default.model('Seat', seatSchema);
exports.default = Seat;
