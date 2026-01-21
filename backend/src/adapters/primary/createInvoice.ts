import { APIGatewayProxyHandler } from 'aws-lambda';
import { connectToDatabase } from '../../infrastructure/DbConfig';
import { MongoUserRepository } from '../secondary/mongo/MongoUserRepository';
import { MongoTransactionRepository } from '../secondary/mongo/MongoTransactionRepository';
import { LNBitsService } from '../secondary/lnbits/LNBitsService';
import { Transaction, TransactionStatus, TransactionType } from '../../core/entities/Transaction';
import { CreateInvoiceRequest } from './api-types';
import { randomUUID } from 'crypto';

const lnBitsService = new LNBitsService();
const userRepository = new MongoUserRepository();
const transactionRepository = new MongoTransactionRepository();

// For local development, Docker containers need to talk to the host machine.
// LNBits running in Docker cannot verify "localhost" because that refers to the container itself.
// We must use "host.docker.internal" (or appropriate network alias) for the callback.
const WEBHOOK_URL = process.env.IS_OFFLINE
  ? 'http://host.docker.internal:3001/dev/webhook' 
  : process.env.WEBHOOK_URL || 'https://api.yourdomain.com/dev/webhook';

console.log('Environment:', process.env.IS_OFFLINE ? 'Local (Offline)' : 'Cloud');
console.log('🔌 Sending Webhook URL to LNBits:', WEBHOOK_URL);

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('🚀 CREATE INVOICE HANDLER - HELLO VERSION 2');
  console.log('Environment:', process.env.IS_OFFLINE ? 'Local (Offline)' : 'Cloud');
  console.log('🔌 Webhook URL to use:', WEBHOOK_URL);
  console.log('Create Invoice Request:', event.body);
  try {
    await connectToDatabase();
    
    const body: CreateInvoiceRequest = JSON.parse(event.body || '{}');
    const { userId, amount, memo, fiatAmount, fiatCurrency } = body;

    if (!userId || !amount) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ message: 'Missing userId or amount' }),
      };
    }

    // 1. Get User
    let user = await userRepository.findById(userId);
    if (!user && userId.includes('@')) {
        user = await userRepository.findByEmail(userId);
    }
    
    if (!user) {
      return {
        statusCode: 404,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ message: 'User not found' }),
      };
    }

    // 1.5 Clean up any previous PENDING invoices for this user (Previene duplicación/ruido en la lista)
    await transactionRepository.markPendingAsExpired(user.id!);

    // 2. Call LNBits
    console.log(`Creating invoice for ${user.email} Amount: ${amount} fiat: ${fiatAmount} ${fiatCurrency} webhook: ${WEBHOOK_URL}`);
    
    const { paymentHash, paymentRequest } = await lnBitsService.createInvoice(
      user.wallet.lnbitsId,
      amount,
      memo || 'Deposit',
      user.wallet.invoiceKey,
      WEBHOOK_URL
    );

    // 3. Create Pending Transaction
    const transaction = new Transaction(
      randomUUID(),
      user.id!,
      paymentHash,
      paymentRequest,
      amount,
      'SAT',
      memo || 'Deposit',
      TransactionStatus.PENDING,
      TransactionType.INCOMING,
      new Date(),
      new Date(),
      fiatAmount,
      fiatCurrency
    );

    await transactionRepository.save(transaction);
    console.log('Transaction saved:', transaction.id);

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        paymentRequest,
        paymentHash,
      }),
    };
  } catch (error: any) {
    console.error('Create Invoice Error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: error.message || 'Internal Server Error' }),
    };
  }
};
