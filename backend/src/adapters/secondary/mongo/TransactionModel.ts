import mongoose, { Schema, Document } from 'mongoose';
import { TransactionStatus, TransactionType } from '../../../core/entities/Transaction';

export interface ITransactionDocument extends Omit<Document, '_id'> {
  _id: string; // We use UUID strings manually
  userId: string;
  paymentHash: string;
  paymentRequest: string;
  amount: number;
  currency: string;
  memo: string;
  status: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
  fiatAmount?: number;
  fiatCurrency?: string;
  metadata?: Record<string, any>;
}

const TransactionSchema: Schema = new Schema({
  _id: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  paymentHash: { type: String, required: true, index: true },
  paymentRequest: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true, default: 'SAT' },
  memo: { type: String, required: false },
  status: { type: String, required: true, enum: Object.values(TransactionStatus), default: TransactionStatus.PENDING },
  type: { type: String, required: true, enum: Object.values(TransactionType), index: true },
  fiatAmount: { type: Number, required: false },
  fiatCurrency: { type: String, required: false },
  metadata: { type: Schema.Types.Mixed, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const TransactionModel = mongoose.model<ITransactionDocument>('Transaction', TransactionSchema);
export const PaymentModel = mongoose.model<ITransactionDocument>('Payment', TransactionSchema);
export const WithdrawalModel = mongoose.model<ITransactionDocument>('Withdrawal', TransactionSchema);
