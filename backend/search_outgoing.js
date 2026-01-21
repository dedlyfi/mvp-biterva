
const mongoose = require('mongoose');
const dbUri = 'mongodb+srv://devdedlyfi_db_user:ArrzeJpT224RkTSJ@clusterdca.fevf2cq.mongodb.net/dev_biterva?retryWrites=true&w=majority';

async function run() {
    try {
        await mongoose.connect(dbUri);
        const transactions = await mongoose.connection.db.collection('transactions').find({type: 'OUTGOING'}).toArray();
        console.log(`Found ${transactions.length} OUTGOING transactions.`);
        console.log('Details:', JSON.stringify(transactions.map(t => ({
            userId: t.userId,
            amount: t.amount,
            status: t.status,
            memo: t.memo,
            date: t.createdAt
        })), null, 2));
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
