import mongoose from 'mongoose';

let isConnected = false;

export const connectToDatabase = async () => {
  if (isConnected) {
    console.log('=> Using existing database connection');
    return;
  }

  console.log('=> Using new database connection');
  try {
    const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/biterva';
    await mongoose.connect(dbUri);
    isConnected = true;

    // Force drop unique index if it exists to allow internal transactions
    try {
        await mongoose.connection.db.collection('transactions').dropIndex('paymentHash_1');
        console.log('✅ Unique index paymentHash_1 dropped successfully');
    } catch (e) {
        // console.log('Index drop info (harmless):', e.message);
    }
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
};
