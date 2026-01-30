import { APIGatewayProxyHandler } from 'aws-lambda';
import axios from 'axios';

// Simple in-memory cache
let cachedPrice: number | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

// LNBits Health Check
const LNBITS_URL = process.env.LNBITS_API_URL || 'http://3.132.82.187:7777';

const checkLNBits = async (): Promise<boolean> => {
    try {
        await axios.get(`${LNBITS_URL}/api/v1/health`, { timeout: 2000 });
        return true;
    } catch (e) {
        return false;
    }
};

export const handler: APIGatewayProxyHandler = async () => {
  const isNodeOnline = await checkLNBits();
  
  try {
    const now = Date.now();
    if (cachedPrice && now - lastFetchTime < CACHE_DURATION) {
      return {
        statusCode: 200,
        headers: { 
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
            cop: cachedPrice,
            nodeOnline: isNodeOnline
        }),
      };
    }

    const response = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=cop'
    );

    const price = response.data.bitcoin.cop;
    cachedPrice = price;
    lastFetchTime = now;

    return {
      statusCode: 200,
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ 
          cop: price,
          nodeOnline: isNodeOnline
      }),
    };
  } catch (error) {
    console.error('Error fetching BTC price:', error);
    return {
      statusCode: 200, 
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ 
          cop: cachedPrice || 400000000, 
          nodeOnline: isNodeOnline
      }),
    };
  }
};
