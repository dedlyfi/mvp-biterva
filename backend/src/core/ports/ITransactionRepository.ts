import { Transaction } from '../entities/Transaction';

export interface ITransactionRepository {
  save(transaction: Transaction): Promise<void>;
  findByPaymentHash(paymentHash: string): Promise<Transaction | null>;
  findByHashAndUser(paymentHash: string, userId: string): Promise<Transaction | null>;
  findByUserId(userId: string): Promise<Transaction[]>;
  completeIfPending(paymentHash: string): Promise<Transaction | null>;
  markPendingAsExpired(userId: string): Promise<void>;
}
