import mongoose, { Document } from 'mongoose';
export interface ITheater extends Document {
    name: string;
    location: string;
    capacity: number;
    screens?: number;
    amenities?: string[];
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ITheater, {}, {}, {}, mongoose.Document<unknown, {}, ITheater, {}> & ITheater & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
