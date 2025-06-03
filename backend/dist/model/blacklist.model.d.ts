import mongoose, { Document } from 'mongoose';
export interface IBlacklist extends Document {
    token: string;
    expiresAt: Date;
}
declare const _default: mongoose.Model<IBlacklist, {}, {}, {}, mongoose.Document<unknown, {}, IBlacklist, {}> & IBlacklist & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
