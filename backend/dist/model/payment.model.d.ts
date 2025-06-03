import mongoose, { Document, Types } from 'mongoose';
import { ITicket } from './ticket.model';
export type PaymentMethod = 'CASH' | 'CARD' | 'ONLINE';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';
export interface IPayment extends Document {
    ticket: Types.ObjectId | ITicket;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    paymentDate: Date;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IPayment, {}, {}, {}, mongoose.Document<unknown, {}, IPayment, {}> & IPayment & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
