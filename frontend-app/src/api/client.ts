import axios from 'axios';

import { API_URL as ENV_API_URL } from '@env';

const FALLBACK_URL = 'https://1awj7cx5ol.execute-api.us-east-2.amazonaws.com/dev';
const getFinalUrl = () => {
    const rawUrl = String(ENV_API_URL || FALLBACK_URL).trim();
    return rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
};

export const API_URL = getFinalUrl();

export const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000, 
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    // Silencia el error de "Invalid credentials" en el login inicial (es flujo normal para usuarios nuevos)
    const isLogin401 = error.response?.status === 401 && error.config?.url?.includes('/login');
    
    if (!isLogin401) {
        console.error('[API Error]', error?.response?.data || error.message);
    }
    
    return Promise.reject(error);
  }
);
