import { APIGatewayProxyHandler } from 'aws-lambda';
import { connectToDatabase } from '../../infrastructure/DbConfig';
import { MongoUserRepository } from '../secondary/mongo/MongoUserRepository';
import { LNBitsService } from '../secondary/lnbits/LNBitsService';
import { SQSProducer } from '../secondary/sqs/SQSProducer';
import { User } from '../../core/entities/User';
import * as bcrypt from 'bcryptjs';

const lnBitsService = new LNBitsService();
const sqsProducer = SQSProducer.getInstance();
const userRepository = new MongoUserRepository();

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    await connectToDatabase();

    const body = JSON.parse(event.body || '{}');
    const { identity, password, name } = body;

    if (!identity || !password || !name) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ message: 'Identity, name, and password are required' }),
      };
    }

    // 1. Generate MongoDB ID upfront
    const { Types } = require('mongoose');
    const mongoId = new Types.ObjectId().toString();

    // 2. Create Wallet in LNBits
    console.log('Creating wallet for:', identity, 'MongoID:', mongoId);
    // Use the full device name (Brand Model ID) for LNBits visibility
    const walletData = await lnBitsService.createWallet(mongoId, name);

    // 3. Hash Password
    const passwordHash = await bcrypt.hash(password, 10);

    // 4. Create User Domain Entity
    const newUser = new User(
      mongoId,
      identity,
      name,
      passwordHash,
      1, // KYC
      {
        lnbitsId: walletData.id,
        adminKey: walletData.adminKey,
        invoiceKey: walletData.invoiceKey,
      },
      0, // Balance
      [] // Rewards
    );

    // 3. Save User using Repository
    console.log('Saving user to Mongo...');
    await userRepository.save(newUser);
    console.log('User saved.');

    // 4. Send Event to SQS
    console.log('Sending event to SQS...');
    await sqsProducer.sendMessage({
      type: 'UserCreatedEvent',
      userId: mongoId, // Pass the ID we just generated
      identity: newUser.identity,
      timestamp: new Date().toISOString(),
    });
    console.log('SQS Event sent.');

    return {
      statusCode: 201,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        message: 'User created successfully',
        user: {
          id: newUser.id,
          identity: newUser.identity,
          name: newUser.name,
          walletId: newUser.wallet.lnbitsId,
          balance: newUser.balance,
        },
      }),
    };
  } catch (error) {
    console.error('Error in signup:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
