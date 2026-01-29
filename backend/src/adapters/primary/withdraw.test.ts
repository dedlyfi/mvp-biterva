import { APIGatewayProxyEvent } from 'aws-lambda';

// Define mocks
const mockUserFindById = jest.fn();
const mockUserSave = jest.fn();
const mockTransactionSave = jest.fn();
const mockPayInvoice = jest.fn();
const mockGetDepositInvoice = jest.fn();
const mockMongooseConnect = jest.fn();

// Mock Mongoose
jest.mock('mongoose', () => ({
  connect: mockMongooseConnect,
}));

// Mock Dependencies
jest.mock('../secondary/mongo/MongoUserRepository', () => {
  return {
    MongoUserRepository: jest.fn().mockImplementation(() => ({
      findById: mockUserFindById,
      save: mockUserSave,
    })),
  };
});

jest.mock('../secondary/mongo/MongoTransactionRepository', () => {
  return {
    MongoTransactionRepository: jest.fn().mockImplementation(() => ({
      save: mockTransactionSave,
    })),
  };
});

jest.mock('../secondary/lnbits/LNBitsService', () => {
  return {
    LNBitsService: jest.fn().mockImplementation(() => ({
      payInvoice: mockPayInvoice,
    })),
  };
});

jest.mock('../secondary/trokera/TrokeraService', () => {
  return {
    TrokeraService: jest.fn().mockImplementation(() => ({
      getDepositInvoice: mockGetDepositInvoice,
    })),
  };
});

jest.mock('uuid', () => ({
  v4: () => 'mock-uuid',
}));

import { handler } from './withdraw';

describe('Withdraw Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMongooseConnect.mockResolvedValue(undefined);
  });

  const mockUser = {
    id: 'user-123',
    balance: 5000,
    wallet: { adminKey: 'admin-key-123' },
  };

  it('should return 400 if userId or amount is missing', async () => {
    const event = { body: JSON.stringify({}) } as APIGatewayProxyEvent;
    const result = await handler(event, {} as any, () => {});
    expect(result).toEqual(expect.objectContaining({ statusCode: 400 }));
  });

  it('should return 404 if user not found', async () => {
    mockUserFindById.mockResolvedValue(null);
    const event = { body: JSON.stringify({ userId: 'user-123', amountSats: 1000 }) } as APIGatewayProxyEvent;
    
    const result = await handler(event, {} as any, () => {});
    
    expect(result).toEqual(expect.objectContaining({ statusCode: 404 }));
  });

  it('should return 400 if insufficient funds', async () => {
    mockUserFindById.mockResolvedValue({ ...mockUser, balance: 500 }); // Less than 1000
    const event = { body: JSON.stringify({ userId: 'user-123', amountSats: 1000 }) } as APIGatewayProxyEvent;
    
    const result = await handler(event, {} as any, () => {});
    
    expect(result).toEqual(expect.objectContaining({ statusCode: 400, body: expect.stringContaining('Insufficient funds') }));
  });

  it('should return 502 if Trokera fails', async () => {
    mockUserFindById.mockResolvedValue({ ...mockUser });
    mockGetDepositInvoice.mockRejectedValue(new Error('API Down'));

    const event = { body: JSON.stringify({ userId: 'user-123', amountSats: 1000 }) } as APIGatewayProxyEvent;
    
    const result = await handler(event, {} as any, () => {});
    
    expect(result).toEqual(expect.objectContaining({ statusCode: 502 }));
  });

  it('should return 400 and NOT decrement balance if LNBits payment fails', async () => {
    mockUserFindById.mockResolvedValue({ ...mockUser });
    mockGetDepositInvoice.mockResolvedValue({ bolt11: 'lnbc1...', chargeId: 'ch_123' });
    mockPayInvoice.mockRejectedValue(new Error('Routing failed'));

    const event = { body: JSON.stringify({ userId: 'user-123', amountSats: 1000 }) } as APIGatewayProxyEvent;
    
    const result = await handler(event, {} as any, () => {});
    
    expect(result).toEqual(expect.objectContaining({ statusCode: 400 }));
    expect(mockUserSave).not.toHaveBeenCalled(); // Balance remains untouched
  });

  it('should process withdrawal successfully', async () => {
    mockUserFindById.mockResolvedValue({ ...mockUser });
    mockGetDepositInvoice.mockResolvedValue({ bolt11: 'lnbc1...', chargeId: 'ch_123' });
    mockPayInvoice.mockResolvedValue({ paymentHash: 'hash_123' });

    const event = { body: JSON.stringify({ userId: 'user-123', amountSats: 1000 }) } as APIGatewayProxyEvent;
    
    const result = await handler(event, {} as any, () => {});
    
    expect(result).toEqual(expect.objectContaining({ statusCode: 200 }));
    
    // Verify Trokera call
    expect(mockGetDepositInvoice).toHaveBeenCalledWith(1000);
    
    // Verify LNBits call
    expect(mockPayInvoice).toHaveBeenCalledWith('admin-key-123', 'lnbc1...');

    // Verify Balance Update
    expect(mockUserSave).toHaveBeenCalled();
    const saveCall = mockUserSave.mock.calls[0][0];
    expect(saveCall.balance).toBe(4000); // 5000 - 1000

    // Verify Transaction Created
    expect(mockTransactionSave).toHaveBeenCalledWith(expect.objectContaining({
      type: 'WITHDRAWAL_FUNDING',
      status: 'FUNDED_IN_TROKERA',
      metadata: { trokeraChargeId: 'ch_123' }
    }));
  });
});
