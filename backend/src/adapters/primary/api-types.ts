/**
 * @example {
 *   "email": "user@example.com"
 * }
 */
export interface SignupRequest {
  email: string;
  name: string;
  password: string;
}

/**
 * @example {
 *   "email": "user@example.com",
 *   "password": "secretpassword"
 * }
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * @example {
 *   "message": "User created successfully",
 *   "user": {
 *     "id": "696d8f7631fb957bc0d01a45",
 *     "email": "user@example.com",
 *     "name": "Jose Berna",
 *     "walletId": "wallet123"
 *   }
 * }
 */
export interface UserResponse {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    walletId: string;
  };
}

/**
 * @example {
 *   "message": "Invalid input data"
 * }
 */
export interface ErrorResponse {
  message: string;
}

/**
 * @example {
 *   "userId": "696d8f7631fb957bc0d01a45",
 *   "amount": 777,
 *   "memo": "First Invoice"
 * }
 */
export interface CreateInvoiceRequest {
  userId: string;
  amount: number;
  memo: string;
  fiatAmount?: number;
  fiatCurrency?: string;
}

/**
 * @example {
 *   "paymentRequest": "lnbc1...",
 *   "paymentHash": "a1b2c3d4..."
 * }
 */
export interface CreateInvoiceResponse {
  paymentRequest: string;
  paymentHash: string;
}

/**
 * @example {
 *   "payment_hash": "a1b2c3d4..."
 * }
 */
export interface PaymentWebhookRequest {
  payment_hash: string;
  amount?: number;
  checking_id?: string;
  memo?: string;
  bolt11?: string;
}

/**
 * @example {
 *   "userId": "696d8f7631fb957bc0d01a45",
 *   "invoice": "lnbc1..."
 * }
 */
export interface PayInvoiceRequest {
  userId: string;
  invoice: string;
  fiatAmount?: number;
  fiatCurrency?: string;
}

/**
 * @example {
 *   "paymentHash": "a1b2c3d4..."
 * }
 */
export interface PayInvoiceResponse {
  paymentHash: string;
}

/**
 * @example {
 *   "userId": "696d8f7631fb957bc0d01a45",
 *   "amountSats": 1000
 * }
 */
export interface WithdrawRequest {
  userId: string;
  amountSats: number;
  nequi?: string;
  observations?: string;
  saveNequi?: boolean;
}

/**
 * @example {
 *   "message": "Withdrawal initiated",
 *   "transactionId": "tx-123",
 *   "trokeraChargeId": "charge-456"
 * }
 */
export interface WithdrawResponse {
  message: string;
  transactionId: string;
  trokeraChargeId: string;
}
