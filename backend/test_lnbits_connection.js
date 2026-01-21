
const axios = require('axios');

async function testConnection() {
  const baseURL = 'http://127.0.0.1:7001';
  // Use the key from .env
  const adminKey = '0e133707611c4315b843951dfec724a6'; 
  
  console.log('--- Testing LNBits Connectivity ---');
  
  // 1. Test Core Health/Wallet (should work if server is up)
  try {
    console.log('1. Testing Core API (Get Wallet)...');
    const res = await axios.get(`${baseURL}/api/v1/wallet`, {
      headers: { 'X-Api-Key': adminKey }
    });
    console.log('✅ Core API Online! Wallet Name:', res.data.name);
    console.log('👤 Wallet User ID:', res.data.user);
    console.log('ℹ️  Full Wallet Info:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('❌ Core API Failed:', err.message, err.response?.status);
  }

  // 2. Test User Manager Extension (GET)
  try {
    console.log('\n2. Testing User Manager (GET users)...');
    // NOTE: This endpoint requires Admin Key.
    const res = await axios.get(`${baseURL}/usermanager/api/v1/users`, {
      headers: { 'X-Api-Key': adminKey }
    });
    console.log('✅ User Manager GET Online! Users found:', res.data.length);
  } catch (err) {
    console.error('❌ User Manager GET Failed:', err.message);
    console.error('   Status:', err.response?.status);
    console.error('   Data:', err.response?.data);
  }

  // 3. Test User Create (POST)
  try {
    console.log('\n3. Testing User Manager (POST create)...');
    const payload = {
      user_name: 'test_user_conn', 
      wallet_name: 'test_wal',
      email: 'test@example.com',
      extra: { test: 'true' }
    };
    const res = await axios.post(`${baseURL}/usermanager/api/v1/users`, payload, {
      headers: { 'X-Api-Key': adminKey }
    });
    console.log('✅ User Manager POST Success! Wallet ID:', res.data.wallets[0].id);
  } catch (err) {
    console.error('❌ User Manager POST Failed:', err.message);
    console.error('   Status:', err.response?.status);
    console.error('   Data:', err.response?.data);
  }
}

testConnection();
