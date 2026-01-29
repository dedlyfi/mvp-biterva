const { MongoClient } = require('mongodb');
require('dotenv').config();

async function run() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('dev_biterva');
    const users = await db.collection('users').find({}).toArray();
    console.log(JSON.stringify(users, null, 2));
  } finally {
    await client.close();
  }
}
run();
