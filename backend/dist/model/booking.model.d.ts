import mongoose, { Document } from 'mongoose';
export interface IBooking extends Document {
    userId: mongoose.Types.ObjectId;
    showtimeId: mongoose.Types.ObjectId;
    seats: string[];
    totalAmount: number;
    status: 'pending' | 'confirmed' | 'cancelled';
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    ticket: mongoose.Types.ObjectId;
    payment: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IBooking, {}, {}, {}, mongoose.Document<unknown, {}, IBooking, {}> & IBooking & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
