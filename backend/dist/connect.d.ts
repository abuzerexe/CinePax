import mongoose from 'mongoose';
declare const connectDB: (mongoUri: string) => Promise<typeof mongoose>;
export default connectDB;
