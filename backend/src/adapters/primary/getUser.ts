import { APIGatewayProxyHandler } from 'aws-lambda';
import { connectToDatabase } from '../../infrastructure/DbConfig';
import { MongoUserRepository } from '../secondary/mongo/MongoUserRepository';
import { MongoTransactionRepository } from '../secondary/mongo/MongoTransactionRepository';
import { LNBitsService } from '../secondary/lnbits/LNBitsService';
import { TransactionStatus } from '../../core/entities/Transaction';

const userRepository = new MongoUserRepository();
const transactionRepository = new MongoTransactionRepository();
const lnBitsService = new LNBitsService();

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { identity } = event.queryStringParameters || {};

    if (!identity) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ message: 'Identity query parameter is required' }),
      };
    }

    await connectToDatabase();
    let user = await userRepository.findByIdentity(identity);

    if (!user) {
      return {
        statusCode: 404,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ message: 'User not found' }),
      };
    }

    // In local development or due to network issues, webhooks might fail.
    // We check PENDING and recently EXPIRED transactions against LNBits to ensure balance is accurate.
    const transactions = await transactionRepository.findByUserId(user.id!);
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const transactionsToCheck = transactions.filter(tx => {
        const isPending = tx.status.toUpperCase() === TransactionStatus.PENDING || tx.status.toLowerCase() === 'pending';
        const isRecentExpired = tx.status.toUpperCase() === TransactionStatus.EXPIRED && tx.createdAt > oneHourAgo;
        return isPending || isRecentExpired;
    });

    let balanceUpdated = false;
    if (transactionsToCheck.length > 0) {
        console.log(`🔍 Checking ${transactionsToCheck.length} transactions (Pending/Recent Expired) for ${identity}`);
        for (const tx of transactionsToCheck) {
            try {
                const { paid } = await lnBitsService.checkPayment(tx.paymentHash, user.wallet.invoiceKey);
                if (paid) {
                    console.log(`✅ Found paid transaction: ${tx.paymentHash}. Completing...`);
                    const completedTx = await transactionRepository.completeIfPending(tx.paymentHash);
                    if (completedTx) {
                        user.balance += completedTx.amount;
                        balanceUpdated = true;
                    }
                }
            } catch (e) {
                console.warn(`⚠️ Failed to check payment for ${tx.paymentHash}:`, e);
            }
        }
    }

    // --- SECOND LAYER: REAL-TIME WALLET SYNC ---
    // Use Admin Key for balance sync as it's more reliable in LNBits, fallback to invoiceKey
    try {
        const syncKey = user.wallet.adminKey || user.wallet.invoiceKey;
        const realBalance = await lnBitsService.getWalletBalance(syncKey);
        
        // If DB balance is still behind or ahead (e.g. external payment acknowledged by LNBits but not by our DB), sync it.
        if (user.balance !== realBalance) {
            console.log(`⚖️ Balance mismatch! DB: ${user.balance} | LNBits: ${realBalance}. Syncing...`);
            user.balance = realBalance;
            balanceUpdated = true;
        }

        if (balanceUpdated) {
            await userRepository.save(user);
            console.log(`💰 User saved with updated balance: ${user.balance} sats`);
        }
    } catch (e) {
        console.warn(`⚠️ Failed to sync real-time balance for ${identity}:`, e);
    }

    // Re-fetch transactions if status changed
    const finalTransactions = await transactionRepository.findByUserId(user.id!);

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        id: user.id,
        identity: user.identity,
        name: user.name,
        walletId: user.wallet.lnbitsId,
        balance: user.balance,
        nequiNumber: user.nequiNumber,
        transactions: finalTransactions.map(tx => ({
          id: tx.id,
          amount: tx.amount,
          type: tx.type.toLowerCase(),
          status: tx.status.toLowerCase(),
          date: tx.createdAt.toISOString(),
          description: tx.memo,
          fiatAmount: tx.fiatAmount,
          fiatCurrency: tx.fiatCurrency
        }))
      }),
    };
  } catch (error) {
    console.error('Error in getUser:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
