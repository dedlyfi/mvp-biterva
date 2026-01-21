import { APIGatewayProxyHandler } from 'aws-lambda';
import { connectToDatabase } from '../../infrastructure/DbConfig';
import { MongoUserRepository } from '../secondary/mongo/MongoUserRepository';
import { MongoTransactionRepository } from '../secondary/mongo/MongoTransactionRepository';
import { SQSProducer } from '../secondary/sqs/SQSProducer';
import { PaymentWebhookRequest } from './api-types';
import { TransactionStatus } from '../../core/entities/Transaction';

const userRepository = new MongoUserRepository();
const transactionRepository = new MongoTransactionRepository();
// const sqsProducer = new SQSProducer(); // Should use singleton

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('🚀 WEBHOOK RECEIVED!', JSON.stringify(event.body));
  const sqsProducer = SQSProducer.getInstance();

  try {
    await connectToDatabase();
    
    // Parses the payload sent by LNBits
    const body: PaymentWebhookRequest = JSON.parse(event.body || '{}');
    const { payment_hash } = body; 

    if (!payment_hash) {
       console.error('Webhook Error: Missing payment_hash in body', body);
       return { 
         statusCode: 400, 
         headers: { 'Access-Control-Allow-Origin': '*' },
         body: JSON.stringify({ message: 'Missing payment_hash' }) 
       };
    }

    // 1. Atomic update to COMPLETED (Previene duplicidad y condiciones de carrera)
    const transaction = await transactionRepository.completeIfPending(payment_hash);
    
    if (!transaction) {
      // Si no devuelve nada, puede ser que: a) No existe, o b) Ya no está PENDING (ya procesada)
      const existing = await transactionRepository.findByPaymentHash(payment_hash);
      if (!existing) {
        console.warn(`⚠️ Transaction not found for hash: ${payment_hash}. Ignoring.`);
        return { 
          statusCode: 200, 
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ message: 'Transaction not found' }) 
        };
      }
      
      if (existing.status === TransactionStatus.COMPLETED) {
        console.log(`✅ Transaction ${payment_hash} already processed. Skipping balance update.`);
        return { 
          statusCode: 200, 
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ message: 'Already processed' }) 
        };
      }

      return { 
        statusCode: 200, 
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ message: 'Transaction in invalid state' }) 
      };
    }

    // 2. Verified Payment -> Update User Balance
    const user = await userRepository.findById(transaction.userId);
    if (!user) {
        console.error(`❌ User ${transaction.userId} not found for transaction ${transaction.id}`);
        return { 
            statusCode: 404, 
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ message: 'User not found' }) 
        };
    }

    console.log(`💰 Crediting user ${user.email} with ${transaction.amount} sats (Original request: ${transaction.fiatAmount} ${transaction.fiatCurrency})`);
    user.balance += transaction.amount;
    await userRepository.save(user);

    console.log(`📝 Transaction ${transaction.id} processed successfully`);

    // 4. Send Gamification Event
    await sqsProducer.sendMessage({
      type: 'PaymentReceivedEvent',
      userId: transaction.userId,
      transactionId: transaction.id,
      amount: transaction.amount,
      createdAt: new Date().toISOString(),
    });

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Payment processed successfully' }),
    };
  } catch (error: any) {
    console.error('Webhook Error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
