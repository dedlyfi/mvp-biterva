
import axios from 'axios';
import * as dotenv from 'dotenv';
import path from 'path';

// Load ecosystem .env
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const run = async () => {
    const apiUrl = process.env.TROKERA_API_URL || 'https://www.trokera.com/api';
    const apiKey = process.env.TROKERA_API_KEY;
    const secretKey = process.env.TROKERA_SECRET_KEY;

    console.log('Testing Trokera API...');
    console.log('URL:', apiUrl);
    console.log('API Key Present:', !!apiKey);
    console.log('Secret Key Present:', !!secretKey);

    if (!apiKey || !secretKey) {
        console.error('Missing credentials');
        return;
    }

    try {
        console.log('Sending request...');
        const payload = {
            currency: "Sats",
            amount: "1000",
            description: "Test Withdrawal Funding",
            pay_currency: "BTC",
            network: "LN"
        };
        console.log('Payload:', JSON.stringify(payload, null, 2));

        const response = await axios.post(
            `${apiUrl}/getPaymentRequest`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': apiKey,
                    'SECRET-KEY': secretKey
                }
            }
        );

        console.log('✅ Success!');
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));

    } catch (error: any) {
        console.error('❌ Error!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
            console.error('Headers:', JSON.stringify(error.response.headers, null, 2));
        } else {
            console.error('Message:', error.message);
        }
    }
};

run();
