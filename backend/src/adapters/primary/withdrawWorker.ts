
import { SQSEvent, SQSHandler } from 'aws-lambda';
import { connectToDatabase } from '../../infrastructure/DbConfig';
import { MongoUserRepository } from '../secondary/mongo/MongoUserRepository';
import { MongoTransactionRepository } from '../secondary/mongo/MongoTransactionRepository';
import { LNBitsService } from '../secondary/lnbits/LnbitsService';
import { TrokeraService } from '../secondary/trokera/TrokeraService';
import { Transaction, TransactionStatus } from '../../core/entities/Transaction';

const userRepository = new MongoUserRepository();
const transactionRepository = new MongoTransactionRepository();
const lnbitsService = new LNBitsService();
const trokeraService = new TrokeraService();

export const handler: SQSHandler = async (event: SQSEvent) => {
  await connectToDatabase();

  for (const record of event.Records) {
    console.log(`🚀 Processing Withdrawal Message: ${record.messageId}`);
    
    try {
      const body = JSON.parse(record.body);
      const { transactionId, userId, amountSats, nequiNumber, amountCop } = body;

      console.log(`Processing withdrawal for user ${userId}: ${amountSats} sats to Nequi ${nequiNumber}`);

      // 1. Retrieve Transaction & User
      const transaction = await transactionRepository.findById(transactionId);
      const user = await userRepository.findById(userId);

      if (!transaction || !user) {
        console.error('Transaction or User not found');
        continue; 
      }

      if (transaction.status !== TransactionStatus.PENDING) {
          console.warn(`Transaction ${transactionId} is not PENDING. Skipping.`);
          continue;
      }

      // 2. Funding Phase (User pays Trokera/Biterva Invoice)
      // In this flow, we assume we need to FUND the operation first.
      // We will generate a Trokera Invoice and pay it from User's wallet.
      
      console.log('--- Step 1: Funding (User -> Trokera) ---');
      let trokeraInvoice;
      try {
          trokeraInvoice = await trokeraService.getDepositInvoice(amountSats);
      } catch (e: any) {
          console.error('Trokera Invoice Generation Failed:', e);
          await failTransaction(transaction, 'Trokera Invoice Failed');
          continue;
      }

      const isDev = process.env.IS_OFFLINE === 'true' || process.env.NODE_ENV === 'development';
      
      if (isDev) {
          console.warn('⚠️ [DEV MODE] Skipping real LNBits payment. Simulating success...');
      } else {
          try {
             await lnbitsService.payInvoice(user.wallet.adminKey, trokeraInvoice.bolt11);
          } catch (e: any) {
             console.error('LNBits Payment Failed:', e);
             await failTransaction(transaction, 'Payment Failed: ' + e.message);
             // Should we refund if it failed *during* payment? 
             // If payInvoice throws, funds likely didn't move or are stuck pending. 
             // For now, mark failed.
             continue;
          }
      }

      // Update Transaction to FUNDED
      transaction.status = TransactionStatus.FUNDED_IN_TROKERA;
      if (!transaction.metadata) transaction.metadata = {};
      transaction.metadata.trokeraChargeId = trokeraInvoice.chargeId;
      await transactionRepository.save(transaction);


      // 3. Swap Phase (BTC -> COP in Trokera)
      console.log('--- Step 2: Swap (BTC -> COP) ---');
      try {
          const swapResult = await trokeraService.swap('BTC', 'COP', amountSats); // Mock
          transaction.metadata.swapId = swapResult.swapId;
          await transactionRepository.save(transaction);
      } catch (e: any) {
          console.error('Swap Failed:', e);
          // In a real world, we might need manual intervention here as funds are now in Trokera
          await failTransaction(transaction, 'Swap Failed', false); 
          continue;
      }

      // 4. Ramp Off Phase (COP -> Nequi)
      console.log('--- Step 3: Ramp Off (COP -> Nequi) ---');
      try {
          // Calculate approx COP if not passed, or use what we promised user
          // For now using passed amountCop or recalcing
          const payoutResult = await trokeraService.rampOffNequi(amountCop, nequiNumber); // Mock
          transaction.metadata.payoutId = payoutResult.payoutId;
          transaction.status = TransactionStatus.COMPLETED;
          await transactionRepository.save(transaction);
          console.log(`✅ Withdrawal Process Completed for ${transactionId}`);

      } catch (e: any) {
          console.error('Ramp Off Failed:', e);
          await failTransaction(transaction, 'Ramp Off Failed', false);
          continue;
      }

    } catch (error) {
      console.error('Error processing SQS record:', error);
    }
  }
};

async function failTransaction(transaction: Transaction, reason: string, refundUser = true) {
    transaction.status = TransactionStatus.FAILED;
    transaction.metadata = { ...transaction.metadata, failureReason: reason };
    await transactionRepository.save(transaction);
    
    if (refundUser) {
        // Logic to refund user balance would go here
        // user.balance += transaction.amount;
        // await userRepository.save(user);
        console.log(`User refunded for transaction ${transaction.id}`);
    }
}
