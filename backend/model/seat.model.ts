import mongoose, { Schema, Document, Model } from 'mongoose';

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

const seatSchema = new Schema<ISeat>({
  showtimeId: {
    type: Schema.Types.ObjectId,
    ref: 'Showtime',
    required: true
  },
  seatNumber: {
    type: String,
    required: true
  },
  row: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['AVAILABLE', 'BOOKED', 'RESERVED'],
    default: 'AVAILABLE'
  },
  version: {
    type: Number,
    default: 0
  },
  lockExpiresAt: {
    type: Date
  },
  lockedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Customer'
  }
}, {
  timestamps: true
});

seatSchema.index({ showtimeId: 1, seatNumber: 1, row: 1 }, { unique: true });

seatSchema.pre('save', function(next) {
  this.version += 1;
  next();
});

seatSchema.statics.acquireLock = async function(
  showtimeId: mongoose.Types.ObjectId,
  seatNumber: string,
  row: string,
  userId: mongoose.Types.ObjectId,
  lockDuration: number = 15 * 60 * 1000 // 15 minutes default
) {
  const now = new Date();
  const lockExpiresAt = new Date(now.getTime() + lockDuration);

  const seat = await this.findOneAndUpdate(
    {
      showtimeId,
      seatNumber,
      row,
      $or: [
        { lockExpiresAt: { $lt: now } },
        { lockExpiresAt: { $exists: false } }
      ]
    },
    {
      $set: {
        lockExpiresAt,
        lockedBy: userId
      }
    },
    { new: true }
  );

  return seat;
};

seatSchema.statics.releaseLock = async function(
  showtimeId: mongoose.Types.ObjectId,
  seatNumber: string,
  row: string,
  userId: mongoose.Types.ObjectId
) {
  return this.findOneAndUpdate(
    {
      showtimeId,
      seatNumber,
      row,
      lockedBy: userId
    },
    {
      $unset: {
        lockExpiresAt: 1,
        lockedBy: 1
      }
    },
    { new: true }
  );
};

seatSchema.statics.updateWithVersion = async function(
  id: mongoose.Types.ObjectId,
  update: any,
  version: number
) {
  return this.findOneAndUpdate(
    {
      _id: id,
      version: version
    },
    {
      $set: update,
      $inc: { version: 1 }
    },
    { new: true }
  );
};

const Seat = mongoose.model<ISeat, ISeatModel>('Seat', seatSchema);

export default Seat; 