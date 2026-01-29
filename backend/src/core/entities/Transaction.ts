export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
  FUNDED_IN_TROKERA = 'FUNDED_IN_TROKERA',
}

export enum TransactionType {
  INCOMING = 'INCOMING',
  OUTGOING = 'OUTGOING',
  WITHDRAWAL_FUNDING = 'WITHDRAWAL_FUNDING',
}

export class Transaction {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly paymentHash: string,
    public readonly paymentRequest: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly memo: string,
    public status: TransactionStatus,
    public readonly type: TransactionType,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public readonly fiatAmount?: number,
    public readonly fiatCurrency?: string,
    public metadata?: Record<string, any>
  ) {}

  public markAsCompleted(): void {
    this.status = TransactionStatus.COMPLETED;
    this.updatedAt = new Date();
  }

  public markAsFailed(): void {
    this.status = TransactionStatus.FAILED;
    this.updatedAt = new Date();
  }
}
