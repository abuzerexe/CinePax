import mongoose, { Document } from 'mongoose';
export interface IShowtime extends Document {
    movieId: mongoose.Types.ObjectId;
    theaterId: mongoose.Types.ObjectId;
    startTime: Date;
    endTime: Date;
    price: number;
    availableSeats: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IShowtime, {}, {}, {}, mongoose.Document<unknown, {}, IShowtime, {}> & IShowtime & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
