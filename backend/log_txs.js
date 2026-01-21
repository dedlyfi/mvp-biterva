
const mongoose = require('mongoose');
const dbUri = 'mongodb+srv://devdedlyfi_db_user:ArrzeJpT224RkTSJ@clusterdca.fevf2cq.mongodb.net/dev_biterva?retryWrites=true&w=majority';

async function run() {
    try {
        await mongoose.connect(dbUri);
        const transactions = await mongoose.connection.db.collection('transactions').find({}).sort({createdAt: -1}).limit(20).toArray();
        console.log('Recent transactions:', JSON.stringify(transactions.map(t => ({
            userId: t.userId,
            type: t.type,
            amount: t.amount,
            status: t.status,
            memo: t.memo,
            hash: t.paymentHash ? t.paymentHash.substring(0, 10) + '...' : 'none'
        })), null, 2));
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
