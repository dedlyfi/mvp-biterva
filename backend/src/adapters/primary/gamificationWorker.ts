import { SQSHandler } from 'aws-lambda';
import { connectToDatabase } from '../../infrastructure/DbConfig';
import { UserModel } from '../secondary/mongo/UserModel';
import { LNBitsService } from '../secondary/lnbits/LNBitsService';

// We might use GamificationRule model here if we had rules in DB
// For simplicity, we'll hardcode a check or assume a rule exists
// import { GamificationRuleModel } from '../secondary/mongo/GamificationRuleModel';

const lnBitsService = new LNBitsService();

export const handler: SQSHandler = async (event) => {
  await connectToDatabase();

  for (const record of event.Records) {
    try {
      const body = JSON.parse(record.body);
      console.log('Processing event:', body);

      if (body.type === 'UserCreatedEvent') {
        const { userId, email } = body;

        // Example Rule: "Signup Bonus" - Give 100 sats
        // Disabled per user request
        const bonusAmount = 0;

        const user = await UserModel.findById(userId);
        if (!user) {
          console.warn(`User not found: ${userId}`);
          continue;
        }

        // Logic to credit user (simulated directly on DB for now as LNBits 'createInvoice' is for receiving)
        // If we wanted to "give" them sats in LNBits, we would need to pay an invoice provided by them
        // or just track it in our DB balance if it's an internal ledger.
        // The prompt says: "credits Sats to the user's balance/wallet". 
        // We'll update our DB balance.
        
        // In a real scenario with LNBits, if we hold the wallet admin key, 
        // we might not "send" payment, but just acknowledge they have balance.
        // OR if this was a faucet, we'd pay an invoice they generate.
        
        // Let's simply update the DB balance as a 'reward'.
        user.balance += bonusAmount;
        user.rewardsHistory.push({
          amount: bonusAmount,
          reason: 'Signup Bonus',
          date: new Date(),
        });

        await user.save();
        console.log(`Credited ${bonusAmount} sats to user ${email}`);
      }
    } catch (error) {
      console.error('Error processing record:', error);
      // Throwing error will cause SQS retry provided it's not handled
    }
  }
};
