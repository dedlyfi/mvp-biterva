export interface ILightningProvider {
  createWallet(userId: string, email: string): Promise<{
    id: string;
    adminKey: string;
    invoiceKey: string;
  }>;

  createInvoice(
    walletId: string,
    amount: number,
    memo: string,
    invoiceKey: string // Pass the key needed for the request
  ): Promise<{
    paymentHash: string;
    paymentRequest: string;
  }>;

  checkPayment(
    paymentHash: string,
    invoiceKey: string // Pass the key needed for the request
  ): Promise<{
    paid: boolean;
  }>;

  payInvoice(
    userAdminKey: string,
    bolt11: string
  ): Promise<{
    paymentHash: string;
  }>;

  decodeInvoice(
    invoiceKey: string, // OR userAdminKey depending on endpoint auth
    bolt11: string
  ): Promise<{
    amount: number;
    memo: string;
  }>;
}
