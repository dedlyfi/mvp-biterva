import { MongoUserRepository } from './MongoUserRepository';
import { UserModel } from './UserModel';
import { User } from '../../../core/entities/User';

jest.mock('./UserModel');

describe('MongoUserRepository', () => {
  let repository: MongoUserRepository;
  const mockFindOne = jest.fn();
  const mockFindById = jest.fn();
  const mockCreate = jest.fn();
  const mockSave = jest.fn();

  beforeAll(() => {
    (UserModel.findOne as jest.Mock) = mockFindOne;
    (UserModel.findById as jest.Mock) = mockFindById;
    (UserModel.create as jest.Mock) = mockCreate;
  });

  beforeEach(() => {
    repository = new MongoUserRepository();
    jest.clearAllMocks();
  });

  const mockUserDomain = new User(
    undefined,
    'test@example.com',
    1,
    { lnbitsId: '123', adminKey: 'admin', invoiceKey: 'invoice' },
    0,
    []
  );

  const mockUserDoc = {
    email: 'test@example.com',
    kycLevel: 1,
    wallet: { lnbitsId: '123', adminKey: 'admin', invoiceKey: 'invoice' },
    balance: 0,
    rewardsHistory: [],
    save: mockSave,
  };

  it('should save a new user', async () => {
    mockFindOne.mockResolvedValue(null);

    await repository.save(mockUserDomain);

    expect(mockFindOne).toHaveBeenCalledWith({ email: mockUserDomain.email });
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      email: mockUserDomain.email,
    }));
  });

  it('should update an existing user', async () => {
    mockFindOne.mockResolvedValue(mockUserDoc);

    const updatedUser = new User(
      undefined,
      'test@example.com',
      2, // upgraded kyc
      { lnbitsId: '123', adminKey: 'admin', invoiceKey: 'invoice' },
      100, // added balance
      []
    );

    await repository.save(updatedUser);

    expect(mockFindOne).toHaveBeenCalledWith({ email: updatedUser.email });
    expect(mockSave).toHaveBeenCalled();
    expect(mockUserDoc.kycLevel).toBe(2);
    expect(mockUserDoc.balance).toBe(100);
  });

  it('should find user by email', async () => {
    mockFindOne.mockResolvedValue(mockUserDoc);

    const user = await repository.findByEmail('test@example.com');

    expect(user).toBeInstanceOf(User);
    expect(user?.email).toBe('test@example.com');
  });

  it('should return null if user not found by email', async () => {
    mockFindOne.mockResolvedValue(null);

    const user = await repository.findByEmail('unknown@example.com');

    expect(user).toBeNull();
  });
});
