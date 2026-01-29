import { APIGatewayProxyHandler } from 'aws-lambda';
import { connectToDatabase } from '../../infrastructure/DbConfig';
import { MongoUserRepository } from '../secondary/mongo/MongoUserRepository';
import * as bcrypt from 'bcryptjs';

const userRepository = new MongoUserRepository();

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    await connectToDatabase();

    const body = JSON.parse(event.body || '{}');
    const { identity, password } = body;

    if (!identity || !password) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ message: 'Identity and password are required' }),
      };
    }

    const user = await userRepository.findByIdentity(identity);
    if (!user) {
      return {
        statusCode: 401,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ message: 'Invalid credentials' }),
      };
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return {
        statusCode: 401,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ message: 'Invalid credentials' }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        message: 'Login successful',
        user: {
          id: user.id,
          identity: user.identity,
          name: user.name,
          walletId: user.wallet.lnbitsId,
          balance: user.balance,
        },
      }),
    };
  } catch (error) {
    console.error('Error in login:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
