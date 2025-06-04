import mongoose, { Document, Types } from 'mongoose';
import { IShowtime } from './showtime.model';
import { ICustomer } from './customer.model';
import { ISeat } from './seat.model';
export interface ITicket extends Document {
    showtime: Types.ObjectId | IShowtime;
    customer: Types.ObjectId | ICustomer;
    seat: Types.ObjectId | ISeat;
    price: number;
    status: 'pending' | 'confirmed' | 'cancelled';
    purchaseDate: Date;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ITicket, {}, {}, {}, mongoose.Document<unknown, {}, ITicket, {}> & ITicket & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
