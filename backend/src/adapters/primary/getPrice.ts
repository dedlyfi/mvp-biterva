import { APIGatewayProxyHandler } from 'aws-lambda';
import axios from 'axios';

// Simple in-memory cache
let cachedPrice: number | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

export const handler: APIGatewayProxyHandler = async () => {
  try {
    const now = Date.now();
    if (cachedPrice && now - lastFetchTime < CACHE_DURATION) {
      console.log('Returning cached price:', cachedPrice);
      return {
        statusCode: 200,
        headers: { 
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ cop: cachedPrice }),
      };
    }

    console.log('Fetching new price from CoinGecko...');
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
      body: JSON.stringify({ cop: price }),
    };
  } catch (error) {
    console.error('Error fetching BTC price:', error);
    return {
      statusCode: 200, // Still return 200 to avoid breaking UI, use fallback
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ cop: cachedPrice || 400000000 }), // Fallback to 400M COP
    };
  }
};
