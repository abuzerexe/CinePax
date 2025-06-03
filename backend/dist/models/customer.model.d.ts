import mongoose, { Document } from 'mongoose';
export interface ICustomer extends Document {
    name: string;
    email: string;
    password: string;
    phone: string;
    isPasswordCorrect(password: string): Promise<boolean>;
}
declare const Customer: mongoose.Model<any, {}, {}, {}, any, any>;
export default Customer;
