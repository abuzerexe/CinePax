import mongoose, { Document, Types } from 'mongoose';
import { ITheater } from './theater.model';
export interface IStaff extends Document {
    theater: Types.ObjectId | ITheater;
    firstName: string;
    lastName: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IStaff, {}, {}, {}, mongoose.Document<unknown, {}, IStaff, {}> & IStaff & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
