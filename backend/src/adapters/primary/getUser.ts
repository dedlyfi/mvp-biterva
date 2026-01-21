import { APIGatewayProxyHandler } from 'aws-lambda';
import { connectToDatabase } from '../../infrastructure/DbConfig';
import { MongoUserRepository } from '../secondary/mongo/MongoUserRepository';
import { MongoTransactionRepository } from '../secondary/mongo/MongoTransactionRepository';

const userRepository = new MongoUserRepository();
const transactionRepository = new MongoTransactionRepository();

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { email } = event.queryStringParameters || {};

    if (!email) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ message: 'Email query parameter is required' }),
      };
    }

    const start = Date.now();
    await connectToDatabase();
    console.log(`DB Connected in ${Date.now() - start}ms`);

    const userStart = Date.now();
    const user = await userRepository.findByEmail(email);
    console.log(`User found in ${Date.now() - userStart}ms`);

    if (!user) {
      return {
        statusCode: 404,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ message: 'User not found' }),
      };
    }

    const transactions = await transactionRepository.findByUserId(user.id!);
    console.log(`Transactions for ${user.email}: ${transactions.length}`);
    console.log(`Types: ${transactions.map(t => t.type).join(', ')}`);

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        walletId: user.wallet.lnbitsId,
        balance: user.balance,
        nequiNumber: user.nequiNumber,
        transactions: transactions.map(tx => ({
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
