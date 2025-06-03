import mongoose, { Document, Model } from 'mongoose';
export interface ISeat extends Document {
    showtimeId: mongoose.Types.ObjectId;
    seatNumber: string;
    row: string;
    status: 'AVAILABLE' | 'BOOKED' | 'RESERVED';
    version: number;
    lockExpiresAt?: Date;
    lockedBy?: mongoose.Types.ObjectId;
}
interface ISeatModel extends Model<ISeat> {
    acquireLock(showtimeId: mongoose.Types.ObjectId, seatNumber: string, row: string, userId: mongoose.Types.ObjectId, lockDuration?: number): Promise<ISeat | null>;
    releaseLock(showtimeId: mongoose.Types.ObjectId, seatNumber: string, row: string, userId: mongoose.Types.ObjectId): Promise<ISeat | null>;
    updateWithVersion(id: mongoose.Types.ObjectId, update: any, version: number): Promise<ISeat | null>;
}
declare const Seat: ISeatModel;
export default Seat;
