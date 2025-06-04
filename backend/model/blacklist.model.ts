import mongoose, { Document, Schema } from 'mongoose';

export interface IBlacklist extends Document {
  token: string;
  expiresAt: Date;
}

const blacklistSchema = new Schema<IBlacklist>({
  token: { 
    type: String, 
    required: true 
  },
  expiresAt: { 
    type: Date, 
    required: true 
  }
});

blacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IBlacklist>('Blacklist', blacklistSchema); 