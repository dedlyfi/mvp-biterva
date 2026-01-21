import { ITransactionRepository } from '../../../core/ports/ITransactionRepository';
import { Transaction, TransactionStatus, TransactionType } from '../../../core/entities/Transaction';
import { TransactionModel, PaymentModel, WithdrawalModel } from './TransactionModel';
import { Model } from 'mongoose';

export class MongoTransactionRepository implements ITransactionRepository {
  
  private getModelForType(type: TransactionType): Model<any> {
    if (type === TransactionType.WITHDRAWAL_FUNDING) {
      return WithdrawalModel;
    }
    if (type === TransactionType.OUTGOING) {
      return PaymentModel;
    }
    return TransactionModel;
  }

  /* Helper to search all collections */
  private async findOneInAll(query: any): Promise<any> {
      const t = await TransactionModel.findOne(query);
      if (t) return t;
      const p = await PaymentModel.findOne(query);
      if (p) return p;
      return WithdrawalModel.findOne(query);
  }

  async save(transaction: Transaction): Promise<void> {
    const ModelToUse = this.getModelForType(transaction.type);
    const existing = await ModelToUse.findById(transaction.id);

    if (existing) {
      existing.status = transaction.status;
      existing.updatedAt = transaction.updatedAt;
      await existing.save();
    } else {
      await ModelToUse.create({
        _id: transaction.id,
        userId: transaction.userId, 
        paymentHash: transaction.paymentHash,
        paymentRequest: transaction.paymentRequest,
        amount: transaction.amount,
        currency: transaction.currency,
        memo: transaction.memo,
        status: transaction.status,
        type: transaction.type,
        fiatAmount: transaction.fiatAmount,
        fiatCurrency: transaction.fiatCurrency,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
        metadata: transaction.metadata
      });
    }
  }

  async findByPaymentHash(paymentHash: string): Promise<Transaction | null> {
    const doc = await this.findOneInAll({ paymentHash });
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findByHashAndUser(paymentHash: string, userId: string): Promise<Transaction | null> {
    const doc = await this.findOneInAll({ paymentHash, userId });
    if (!doc) return null;
    return this.toDomain(doc);
  }
  
  async findByUserId(userId: string): Promise<Transaction[]> {
    const [transactions, payments, withdrawals] = await Promise.all([
      TransactionModel.find({ userId }).sort({ createdAt: -1 }).limit(50),
      PaymentModel.find({ userId }).sort({ createdAt: -1 }).limit(50),
      WithdrawalModel.find({ userId }).sort({ createdAt: -1 }).limit(50)
    ]);
    
    const allDocs = [...transactions, ...payments, ...withdrawals];
    allDocs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return allDocs.map(doc => this.toDomain(doc));
  }

  async completeIfPending(paymentHash: string): Promise<Transaction | null> {
    let doc = await TransactionModel.findOneAndUpdate(
      { paymentHash, status: TransactionStatus.PENDING },
      { $set: { status: TransactionStatus.COMPLETED, updatedAt: new Date() } },
      { new: true }
    );
    if (doc) return this.toDomain(doc);

    doc = await PaymentModel.findOneAndUpdate(
        { paymentHash, status: TransactionStatus.PENDING },
        { $set: { status: TransactionStatus.COMPLETED, updatedAt: new Date() } },
        { new: true }
      );
    if (doc) return this.toDomain(doc);

    doc = await WithdrawalModel.findOneAndUpdate(
        { paymentHash, status: TransactionStatus.PENDING },
        { $set: { status: TransactionStatus.COMPLETED, updatedAt: new Date() } },
        { new: true }
      );
    if (doc) return this.toDomain(doc);

    return null;
  }

  async markPendingAsExpired(userId: string): Promise<void> {
    // Usually only Invoices (TransactionModel) expire.
    await TransactionModel.updateMany(
      { userId, status: TransactionStatus.PENDING },
      { $set: { status: TransactionStatus.EXPIRED, updatedAt: new Date() } }
    );
  }

  private toDomain(doc: any): Transaction {
    return new Transaction(
      doc._id,
      doc.userId,
      doc.paymentHash,
      doc.paymentRequest || '',
      doc.amount,
      doc.currency,
      doc.memo || '',
      doc.status as TransactionStatus,
      doc.type as TransactionType,
      doc.createdAt,
      doc.updatedAt,
      doc.fiatAmount,
      doc.fiatCurrency,
      doc.metadata
    );
  }
}
