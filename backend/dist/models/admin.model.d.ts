import mongoose, { Document } from 'mongoose';
export interface IAdmin extends Document {
    name: string;
    email: string;
    password: string;
    phone: string;
    isPasswordCorrect(password: string): Promise<boolean>;
}
declare const Admin: mongoose.Model<any, {}, {}, {}, any, any>;
export default Admin;
