import { handler } from './gamificationWorker';
import { SQSEvent } from 'aws-lambda';
import { UserModel } from '../secondary/mongo/UserModel';
import { connectToDatabase } from '../../infrastructure/DbConfig';

// Mocks
jest.mock('../secondary/mongo/UserModel');
jest.mock('../../infrastructure/DbConfig');
jest.mock('../secondary/lnbits/LNBitsService'); // Mocked but maybe not used actively in the simplified handler logic yet

describe('Gamification Worker', () => {
  const mockFindById = jest.fn();
  const mockSave = jest.fn();

  beforeAll(() => {
    (UserModel.findById as jest.Mock) = mockFindById;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process UserCreatedEvent and add bonus', async () => {
    const mockUser = {
      _id: 'user-id',
      email: 'test@example.com',
      balance: 0,
      rewardsHistory: [],
      save: mockSave,
    };
    mockFindById.mockResolvedValue(mockUser);

    const event = {
      Records: [
        {
          body: JSON.stringify({
            type: 'UserCreatedEvent',
            userId: 'user-id',
            email: 'test@example.com',
          }),
        },
      ],
    } as SQSEvent;

    await handler(event, {} as any, () => {});

    expect(connectToDatabase).toHaveBeenCalled();
    expect(mockFindById).toHaveBeenCalledWith('user-id');
    expect(mockSave).toHaveBeenCalled();
    expect(mockUser.balance).toBe(100);
    expect(mockUser.rewardsHistory).toHaveLength(1);
    expect(mockUser.rewardsHistory[0]).toMatchObject({
      amount: 100,
      reason: 'Signup Bonus',
    });
  });

  it('should ignore unknown event types', async () => {
    const event = {
      Records: [
        {
          body: JSON.stringify({
            type: 'UnknownEvent',
          }),
        },
      ],
    } as SQSEvent;

    await handler(event, {} as any, () => {});

    expect(mockFindById).not.toHaveBeenCalled();
  });

  it('should handle user not found', async () => {
    mockFindById.mockResolvedValue(null);

    const event = {
      Records: [
        {
          body: JSON.stringify({
            type: 'UserCreatedEvent',
            userId: 'unknown-id',
          }),
        },
      ],
    } as SQSEvent;

     await handler(event, {} as any, () => {});

     expect(mockFindById).toHaveBeenCalledWith('unknown-id');
     expect(mockSave).not.toHaveBeenCalled();
  });
});
