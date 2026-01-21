import axios from 'axios';

export class TrokeraService {
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly secretKey: string;

  constructor() {
    this.apiUrl = process.env.TROKERA_API_URL || 'https://www.trokera.com/api';
    this.apiKey = process.env.TROKERA_API_KEY || '';
    this.secretKey = process.env.TROKERA_SECRET_KEY || '';

    if (!this.apiKey || !this.secretKey) {
      console.warn('⚠️ TROKERA_API_KEY or TROKERA_SECRET_KEY is not set.');
    }
  }

  async getDepositInvoice(amountSats: number): Promise<{ bolt11: string; chargeId: string }> {
    try {
      console.log('🔗 Calling Trokera GetPaymentRequest');

      const response = await axios.post(
        `${this.apiUrl}/getPaymentRequest`,
        {
          currency: "Sats",
          amount: amountSats.toString(),
          description: "User Withdrawal Funding",
          pay_currency: "BTC",
          network: "LN",
          tax: "0"
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': this.apiKey,
            'SECRET-KEY': this.secretKey
          }
        }
      );

      console.log('✅ Trokera Response:', JSON.stringify(response.data));

      // Assuming structure based on typical APIs, prompt says response contains bolt11 and charge_id
      // Need to adjust extraction based on actual response structure if known, otherwise generic access
      const data = response.data;

      if (!data.data.lightning_payment_request) {
        throw new Error('No bolt11 invoice found in Trokera response');
      }

      return {
        bolt11: data.data.lightning_payment_request,
        chargeId: data.request_id
      };

    } catch (error: any) {
      console.error('❌ Trokera API Failed!');
      console.error('Status:', error.response?.status);
      console.error('Data:', JSON.stringify(error.response?.data));

      // If network param error, log specifically (as per prompt hint)
      if (error.response?.data?.message?.includes('network')) {
        console.warn('⚠️ Check network parameter: LN vs BTC-LN vs LIGHTNING');
      }

  async swap(sourceCurrency: string, targetCurrency: string, amount: number): Promise<{ success: boolean; swapId: string }> {
    console.log(`🔗 Mocking Trokera Swap: ${amount} ${sourceCurrency} -> ${targetCurrency}`);
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, swapId: `swap-${Date.now()}` };
  }

  async rampOffNequi(amountCop: number, nequiNumber: string): Promise<{ success: boolean; payoutId: string }> {
     console.log(`🔗 Mocking Trokera RampOff Nequi: $${amountCop} to ${nequiNumber}`);
     // Simulate delay
     await new Promise(resolve => setTimeout(resolve, 500));
     return { success: true, payoutId: `payout-${Date.now()}` };
  }
}
