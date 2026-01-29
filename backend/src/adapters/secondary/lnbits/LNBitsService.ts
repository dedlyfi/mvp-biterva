import axios from 'axios';
import { ILightningProvider } from '../../../core/ports/ILightningProvider';

export class LNBitsService implements ILightningProvider {
  private readonly apiUrl: string;
  private readonly adminKey: string; // Admin key for creating users/wallets (the super admin)

  constructor() {
    this.apiUrl = process.env.LNBITS_API_URL || 'https://legend.lnbits.com';
    this.adminKey = process.env.LNBITS_ADMIN_KEY || '';

    if (!this.adminKey) {
      console.warn('LNBITS_ADMIN_KEY is not set. Wallet creation will fail.');
    }
  }

  async createWallet(userId: string, email: string): Promise<{
    id: string;
    adminKey: string;
    invoiceKey: string;
  }> {
    // Use MASTER_WALLET_ADMIN_KEY for user manager operations
    const masterKey = process.env.LNBITS_MASTER_WALLET_ADMIN_KEY || process.env.MASTER_WALLET_ADMIN_KEY || this.adminKey;

    // Mock Mode for Local Development (Bypass LNBits)
    if (process.env.MOCK_LNBITS === 'true') {
      console.warn('⚠️ USING MOCK LNBITS SERVICE');
      return {
        id: 'mock-wallet-' + Math.random().toString(36).substring(7),
        adminKey: 'mock-admin-key',
        invoiceKey: 'mock-invoice-key',
      };
    }

    try {
      console.log('🔗 Calling LNBits URL:', `${this.apiUrl}/usermanager/api/v1/users`);
      console.log('🔑 Using Master Key:', masterKey ? `${masterKey.substring(0, 4)}...` : 'NONE');
      
      const response = await axios.post(
        `${this.apiUrl}/usermanager/api/v1/users`,
        {
          user_name: userId,
          wallet_name: 'Biterva Wallet',
          email: email,
          extra: {
            mongo_id: userId,
            email: email
          }
        },
        {
          headers: {
            'X-Api-Key': masterKey,
          },
        }
      );

      // Adaptation: LNBits User Manager check response structure
      // Usually returns: { "id": "...", "name": "...", "wallets": [ { "id": "...", "inkey": "...", "adminkey": "..." } ] }
      const wallet = response.data.wallets[0];

      return {
        id: wallet.id,
        adminKey: wallet.adminkey,
        invoiceKey: wallet.inkey,
      };
    } catch (error: any) {
      // DEBUG: Commented out to see real error
      // if (error.response?.status === 404) {
      //    throw new Error('LNBits User Manager extension not found. Please enable it in your LNBits instance.');
      // }
      console.error('❌ LNBits Create Wallet Request Failed!');
      console.error('URL:', error.config?.url);
      console.error('Status:', error.response?.status);
      console.error('Data:', JSON.stringify(error.response?.data));
      
      console.error('LNBits Create Wallet Error:', error.response?.data || error.message);
      throw new Error('Failed to create Lightning Wallet');
    }
  }

  async createInvoice(
    walletId: string, // Not strictly needed if we have invoiceKey, but good for context
    amount: number,
    memo: string,
    invoiceKey: string,
    webhook?: string
  ): Promise<{
    paymentHash: string;
    paymentRequest: string;
  }> {
    console.log(`🔗 LNBits API Request: POST ${this.apiUrl}/api/v1/payments`);
    console.log(`🔑 Key: ${invoiceKey.substring(0, 8)}...`);
    try {
      const response = await axios.post(
        `${this.apiUrl}/api/v1/payments`,
        {
          out: false,
          amount: amount,
          memo: memo,
          webhook: webhook,
        },
        {
          headers: {
            'X-Api-Key': invoiceKey,
          },
        }
      );

      return {
        paymentHash: response.data.payment_hash,
        paymentRequest: response.data.payment_request,
      };
    } catch (error: any) {
      console.error('Error creating invoice:', error.response?.data || error.message);
      throw new Error(`Failed to create Lightning Invoice: ${JSON.stringify(error.response?.data || error.message)}`);
    }
  }

  async checkPayment(
    paymentHash: string,
    invoiceKey: string
  ): Promise<{
    paid: boolean;
  }> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/api/v1/payments/${paymentHash}`,
        {
          headers: {
            'X-Api-Key': invoiceKey,
          },
        }
      );

      return {
        paid: response.data.paid,
      };
    } catch (error) {
      console.error('Error checking payment:', error);
      throw new Error('Failed to check payment status');
    }
  }

  async payInvoice(
    userAdminKey: string,
    bolt11: string
  ): Promise<{
    paymentHash: string;
  }> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/api/v1/payments`,
        {
          out: true,
          bolt11: bolt11,
        },
        {
          headers: {
            'X-Api-Key': userAdminKey,
          },
        }
      );

      return {
        paymentHash: response.data.payment_hash,
      };
    } catch (error: any) {
        console.error('Error paying invoice:', error.response?.data || error);
        const lnbitsError = error.response?.data?.detail || error.response?.data?.message || error.message;
        throw new Error(`LNBits Payment Failed: ${lnbitsError}`);
    }
  }

  async decodeInvoice(
    invoiceKey: string,
    bolt11: string
  ): Promise<{
    amount: number;
    memo: string;
  }> {
      try {
          console.log(`Decoding invoice: ${bolt11}`);
          const response = await axios.post(
              `${this.apiUrl}/api/v1/payments/decode`,
              {
                  data: bolt11
              },
              {
                  headers: {
                      'X-Api-Key': invoiceKey
                  }
              }
          );

          console.log('LNBits Decode Response:', JSON.stringify(response.data));

          // LNBits decode returns { ... amount: <msats> or <sats>, ... }
          // Often it returns 'amount' in msats or sats depending on version, 
          // but typically for decode it might return 'amount_msat'.
          // Let's verify standard LNBits behavior or assume standard 'amount' field if present.
          // NOTE: API docs for LNBits /api/v1/payments/decode says it returns decoded invoice data.
          
          let amount = response.data.amount_msat ? Math.floor(response.data.amount_msat / 1000) : response.data.amount;
          
          return {
              amount: amount, 
              memo: response.data.description || response.data.memo || ''
          };
      } catch (error: any) {
          console.error('Error decoding invoice:', error.response?.data || error);
          throw new Error('Failed to decode Lightning Invoice');
      }
  }
}
