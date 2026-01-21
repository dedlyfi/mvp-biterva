import { APIGatewayProxyEvent } from 'aws-lambda';
import { connectToDatabase } from '../../infrastructure/DbConfig';

// Define mocks outside
const mockCreateWallet = jest.fn();
const mockSendMessage = jest.fn();
const mockSave = jest.fn();

// Mocks with factories
jest.mock('../secondary/lnbits/LNBitsService', () => {
  return {
    LNBitsService: jest.fn().mockImplementation(() => {
      return {
        createWallet: mockCreateWallet,
      };
    }),
  };
});

jest.mock('../secondary/sqs/SQSProducer', () => {
  return {
    SQSProducer: jest.fn().mockImplementation(() => {
      return {
        sendMessage: mockSendMessage,
      };
    }),
  };
});

jest.mock('../secondary/mongo/MongoUserRepository', () => {
  return {
    MongoUserRepository: jest.fn().mockImplementation(() => {
      return {
        save: mockSave,
      };
    }),
  };
});

jest.mock('../../infrastructure/DbConfig');

import { handler } from './signup';

describe('Signup Handler', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateWallet.mockResolvedValue({
      id: 'wallet-id',
      adminKey: 'admin-key',
      invoiceKey: 'invoice-key',
    });
    mockSave.mockResolvedValue(undefined);
  });

  it('should create user and wallet successfully', async () => {
    const event = {
      body: JSON.stringify({ email: 'test@example.com' }),
    } as APIGatewayProxyEvent;

    const result = await handler(event, {} as any, () => {});

    expect(connectToDatabase).toHaveBeenCalled();
    expect(mockCreateWallet).toHaveBeenCalledWith('test@example.com');
    // Verify repository save was called with correct user object
    expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({
      email: 'test@example.com',
      wallet: expect.objectContaining({
        lnbitsId: 'wallet-id',
      }),
    }));
    expect(mockSendMessage).toHaveBeenCalledWith(expect.objectContaining({
      type: 'UserCreatedEvent',
      email: 'test@example.com',
    }));
    expect(result).toEqual(expect.objectContaining({
      statusCode: 201,
      body: expect.stringContaining('User created successfully'),
    }));
  });

  it('should return 400 if email is missing', async () => {
    const event = {
      body: JSON.stringify({}),
    } as APIGatewayProxyEvent;

    const result = await handler(event, {} as any, () => {});

    expect(result).toEqual({
      statusCode: 400,
      body: JSON.stringify({ message: 'Email is required' }),
    });
    expect(mockCreateWallet).not.toHaveBeenCalled();
  });

  it('should return 500 if wallet creation fails', async () => {
     mockCreateWallet.mockRejectedValue(new Error('LNBits Error'));

      const event = {
      body: JSON.stringify({ email: 'fail@example.com' }),
    } as APIGatewayProxyEvent;

    const result = await handler(event, {} as any, () => {});

    expect(result).toEqual({
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    });
  });
});
