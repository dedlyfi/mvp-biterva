import { APIGatewayProxyHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { MongoUserRepository } from '../secondary/mongo/MongoUserRepository';
import { MongoTransactionRepository } from '../secondary/mongo/MongoTransactionRepository';
import { LNBitsService } from '../secondary/lnbits/LNBitsService';
import { TrokeraService } from '../secondary/trokera/TrokeraService';
import { Transaction, TransactionStatus, TransactionType } from '../../core/entities/Transaction';
import { WithdrawRequest, WithdrawResponse, ErrorResponse } from './api-types';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';

const mongoDetails = {
    uri: process.env.MONGODB_URI,
};

let isConnected = false;

const connectToDatabase = async () => {
    if (isConnected) return;
    try {
        if (!mongoDetails.uri) throw new Error('MONGODB_URI is not defined');
        await mongoose.connect(mongoDetails.uri);
        isConnected = true;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw new Error('Database connection failed');
    }
};

const userRepository = new MongoUserRepository();
const transactionRepository = new MongoTransactionRepository();
const lnbitsService = new LNBitsService();
const trokeraService = new TrokeraService();

export const handler: APIGatewayProxyHandler = async (event) => {
    try {
        await connectToDatabase();

        const body: WithdrawRequest = JSON.parse(event.body || '{}');
        const { userId, amountSats, nequi, observations } = body;

        console.log('*Withdraw-REQUEST*', JSON.stringify(body));

        if (!userId || !amountSats || amountSats <= 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: '*Withdraw-REQUEST*Invalid userId or amount' } as ErrorResponse),
            };
        }

        // 1. Get User
        const user = await userRepository.findById(userId);
        if (!user) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: '*Withdraw-REQUEST*User not found' } as ErrorResponse),
            };
        }

        if (!user.wallet?.adminKey) {
             return {
                statusCode: 400,
                body: JSON.stringify({ message: '*Withdraw-REQUEST* User wallet not configured' } as ErrorResponse),
            };
        }
        
        if (user.balance < amountSats) {
             return {
                statusCode: 400,
                body: JSON.stringify({ message: '*Withdraw-REQUEST* Insufficient funds' } as ErrorResponse),
            };
        }

        // 2. Save Nequi Preference (Early Save)
        // Requested behavior: Save the number even if withdrawal fails or isn't completed immediately.
        if (body.saveNequi && user.nequiNumber !== nequi && nequi) {
            user.nequiNumber = nequi;
            await userRepository.save(user);
            console.log(`*Withdraw-REQUEST* Updated saved Nequi number for user ${userId}`);
        }

        // 3. Update Balance (Decrement Immediately to reserve funds)
        user.balance -= amountSats;
        await userRepository.save(user);

        // 4. Create PENDING Transaction
        const transactionId = uuidv4();
        const transaction = new Transaction(
            transactionId,
            userId,
            'pending-withdrawal-' + Date.now(), // Temp Payment Hash
            '', // No Bolt11 yet
            amountSats,
            'SAT',
            'Withdrawal to Nequi',
            TransactionStatus.PENDING,
            TransactionType.WITHDRAWAL_FUNDING,
            new Date(),
            new Date(),
            undefined,
            undefined,
            { 
               nequiNumber: nequi,
               observations: observations
            }
        );

        await transactionRepository.save(transaction);

        // 5. Send to SQS Worker
        try {
            const sqs: any = new AWS.SQS({
                endpoint: process.env.IS_OFFLINE ? 'http://localhost:9324' : undefined,
                region: process.env.AWS_REGION
            });

            await sqs.sendMessage({
                QueueUrl: process.env.IS_OFFLINE 
                    ? 'http://localhost:9324/queue/WithdrawalQueue' 
                    : process.env.WITHDRAWAL_QUEUE_URL,
                MessageBody: JSON.stringify({
                    transactionId,
                    userId,
                    amountSats,
                    nequiNumber: nequi,
                })
            }).promise();

            console.log(`Sent withdrawal ${transactionId} to queue`);

        } catch (error) {
            console.error('Failed to send to SQS:', error);
            // Rollback balance
            user.balance += amountSats;
            await userRepository.save(user);
            
            transaction.status = TransactionStatus.FAILED;
            await transactionRepository.save(transaction);
            
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Internal Queue Error. Please try again.' } as ErrorResponse)
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Withdrawal initiated successfully. Processing in background.',
                transactionId: transaction.id
            } as WithdrawResponse),
        };

    } catch (error: any) {
        console.error('Handler Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error: ' + error.message } as ErrorResponse),
        };
    }
};
