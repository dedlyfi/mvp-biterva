
const mongoose = require('mongoose');
const dbUri = 'mongodb+srv://devdedlyfi_db_user:ArrzeJpT224RkTSJ@clusterdca.fevf2cq.mongodb.net/dev_biterva?retryWrites=true&w=majority';

async function run() {
    try {
        await mongoose.connect(dbUri);
        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        console.log('Users:', JSON.stringify(users.map(u => ({
            id: u._id,
            email: u.email,
            balance: u.balance
        })), null, 2));
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
