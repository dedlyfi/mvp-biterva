import mongoose, { Schema, Document } from 'mongoose';

export interface IUserDocument extends Document {
  email: string;
  name: string;
  passwordHash: string;
  kycLevel: number;
  wallet: {
    lnbitsId: string;
    adminKey: string;
    invoiceKey: string;
  };
  balance: number;
  rewardsHistory: Array<{
    amount: number;
    reason: string;
    date: Date;
  }>;
  nequiNumber?: string;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  passwordHash: { type: String, required: true },
  kycLevel: { type: Number, default: 0 },
  wallet: {
    lnbitsId: { type: String, required: true },
    adminKey: { type: String, required: true },
    invoiceKey: { type: String, required: true },
  },
  balance: { type: Number, default: 0 },
  rewardsHistory: [
    {
      amount: { type: Number, required: true },
      reason: { type: String, required: true },
      date: { type: Date, default: Date.now },
    },
  ],
  nequiNumber: { type: String },
});

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);
