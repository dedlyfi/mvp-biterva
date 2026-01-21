import { LNBitsService } from './LNBitsService';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('LNBitsService', () => {
  let lnbitsService: LNBitsService;

  beforeEach(() => {
    process.env.LNBITS_API_URL = 'http://mock-lnbits.com';
    process.env.LNBITS_ADMIN_KEY = 'mock-admin-key';
    lnbitsService = new LNBitsService();
    jest.clearAllMocks();
  });

  it('should create wallet', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        wallets: [
          {
            id: 'wallet-id',
            adminkey: 'admin-key',
            inkey: 'invoice-key',
          },
        ],
      },
    });

    const result = await lnbitsService.createWallet('user-id', 'user@example.com');

    expect(result).toEqual({
      id: 'wallet-id',
      adminKey: 'admin-key',
      invoiceKey: 'invoice-key',
    });
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://mock-lnbits.com/usermanager/api/v1/users',
      {
        user_name: 'user@example.com',
        wallet_name: 'Biterva Wallet',
      },
      expect.objectContaining({
        headers: {
          'X-Api-Key': 'mock-admin-key',
        },
      })
    );
  });

  it('should use LNBITS_MASTER_WALLET_ADMIN_KEY if present', async () => {
    process.env.LNBITS_MASTER_WALLET_ADMIN_KEY = 'super-secret-master-key';
    
    // Re-instantiate to pick up env var if needed (implementation reads env in call, not constructor, but good to be safe)
    // Actually implementation reads it inside createWallet method.
    
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        wallets: [
          {
            id: 'wallet-id',
            adminkey: 'admin-key',
            inkey: 'invoice-key',
          },
        ],
      },
    });

    await lnbitsService.createWallet('user2-id', 'user2@example.com');

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object),
      expect.objectContaining({
        headers: {
          'X-Api-Key': 'super-secret-master-key',
        },
      })
    );
    
    delete process.env.LNBITS_MASTER_WALLET_ADMIN_KEY;
  });

  it('should throw specific error if User Manager extension is missing (404)', async () => {
    const error: any = new Error('Not Found');
    error.response = { status: 404 };
    mockedAxios.post.mockRejectedValueOnce(error);

    await expect(lnbitsService.createWallet('user-id', 'user@example.com'))
      .rejects
      .toThrow('LNBits User Manager extension not found. Please enable it in your LNBits instance.');
  });

  it('should create invoice', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        payment_hash: 'hash123',
        payment_request: 'lnbc123...',
      },
    });

    const result = await lnbitsService.createInvoice(
      'wallet-id',
      100,
      'Test Memo',
      'invoice-key'
    );

    expect(result).toEqual({
      paymentHash: 'hash123',
      paymentRequest: 'lnbc123...',
    });
  });
});
