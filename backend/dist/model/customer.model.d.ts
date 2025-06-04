import mongoose, { Document } from 'mongoose';
export interface ICustomer extends Document {
    fullName: string;
    email: string;
    password: string;
    phone: string;
    refreshToken?: string;
    createdAt: Date;
    updatedAt: Date;
    isPasswordCorrect(password: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
}
declare const _default: mongoose.Model<ICustomer, {}, {}, {}, mongoose.Document<unknown, {}, ICustomer, {}> & ICustomer & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
