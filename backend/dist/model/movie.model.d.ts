import mongoose, { Document } from 'mongoose';
export interface IMovie extends Document {
    title: string;
    year: number;
    duration: number;
    genre: string;
    releaseDate: Date;
    image: string;
    description: string;
    rating: number;
    director?: string;
    cast?: string[];
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IMovie, {}, {}, {}, mongoose.Document<unknown, {}, IMovie, {}> & IMovie & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
