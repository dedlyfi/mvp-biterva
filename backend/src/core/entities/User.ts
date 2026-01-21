export class User {
  constructor(
    public readonly id: string | undefined, // Added ID
    public readonly email: string,
    public readonly name: string,
    public readonly passwordHash: string,
    public kycLevel: number,
    public wallet: {
      lnbitsId: string;
      adminKey: string;
      invoiceKey: string;
    },
    public balance: number,
    public rewardsHistory: Array<{
      amount: number;
      reason: string;
      date: Date;
    }>,
    public nequiNumber?: string,
  ) {}

  public addReward(amount: number, reason: string): void {
    this.balance += amount;
    this.rewardsHistory.push({
      amount,
      reason,
      date: new Date(),
    });
  }

  public updateKyc(level: number): void {
    this.kycLevel = level;
  }
}
