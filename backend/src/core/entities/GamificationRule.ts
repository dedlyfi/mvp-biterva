export class GamificationRule {
  constructor(
    public readonly triggerEvent: string,
    public readonly condition: string, // e.g., "first_transaction", "volume_over_1000"
    public readonly rewardAmount: number,
    public isActive: boolean
  ) {}
}
