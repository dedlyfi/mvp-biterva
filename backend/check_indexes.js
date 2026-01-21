
const mongoose = require('mongoose');
const dbUri = 'mongodb+srv://devdedlyfi_db_user:ArrzeJpT224RkTSJ@clusterdca.fevf2cq.mongodb.net/dev_biterva?retryWrites=true&w=majority';

async function run() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(dbUri);
        console.log('Connected.');

        const indexes = await mongoose.connection.db.collection('transactions').indexes();
        console.log('Indexes on transactions:', JSON.stringify(indexes, null, 2));

        const uniqueIndex = indexes.find(idx => idx.unique && (idx.name.includes('paymentHash') || idx.key.paymentHash));
        if (uniqueIndex) {
            console.log('Found unique index:', uniqueIndex.name);
        } else {
            console.log('No unique index found on paymentHash.');
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
