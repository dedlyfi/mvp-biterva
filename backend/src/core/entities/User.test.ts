import { User } from './User';

describe('User Entity', () => {
  it('should initialize correctly', () => {
    const user = new User(
      undefined,
      'test@example.com',
      1,
      { lnbitsId: '123', adminKey: 'admin', invoiceKey: 'invoice' },
      0,
      []
    );

    expect(user.email).toBe('test@example.com');
    expect(user.balance).toBe(0);
    expect(user.rewardsHistory).toHaveLength(0);
  });

  it('should add reward and update balance', () => {
    const user = new User(
      undefined,
      'test@example.com',
      1,
      { lnbitsId: '123', adminKey: 'admin', invoiceKey: 'invoice' },
      0,
      []
    );

    user.addReward(100, 'Test Reward');

    expect(user.balance).toBe(100);
    expect(user.rewardsHistory).toHaveLength(1);
    expect(user.rewardsHistory[0].amount).toBe(100);
    expect(user.rewardsHistory[0].reason).toBe('Test Reward');
  });

  it('should update KYC level', () => {
    const user = new User(
      undefined,
      'test@example.com',
      1,
      { lnbitsId: '123', adminKey: 'admin', invoiceKey: 'invoice' },
      0,
      []
    );

    user.updateKyc(2);
    expect(user.kycLevel).toBe(2);
  });
});
