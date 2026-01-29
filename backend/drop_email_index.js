
const mongoose = require('mongoose');
const dbUri = 'mongodb+srv://devdedlyfi_db_user:ArrzeJpT224RkTSJ@clusterdca.fevf2cq.mongodb.net/dev_biterva?retryWrites=true&w=majority';

async function run() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(dbUri);
        console.log('Connected.');

        const collection = mongoose.connection.db.collection('users');
        const indexes = await collection.indexes();
        console.log('Current indexes on users:', JSON.stringify(indexes, null, 2));

        const emailIndex = indexes.find(idx => idx.name === 'email_1');
        if (emailIndex) {
            console.log('Found old index "email_1". Dropping it...');
            await collection.dropIndex('email_1');
            console.log('Successfully dropped "email_1" index.');
        } else {
            console.log('Index "email_1" not found. No action needed.');
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
