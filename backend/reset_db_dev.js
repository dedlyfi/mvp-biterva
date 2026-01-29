const { MongoClient } = require('mongodb');
require('dotenv').config();

async function run() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('dev_biterva');
    const res = await db.collection('users').deleteMany({});
    console.log(`Deleted ${res.deletedCount} users.`);
    await db.collection('transactions').deleteMany({});
    console.log(`Deleted transactions.`);
  } finally {
    await client.close();
  }
}
run();
