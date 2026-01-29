import axios from 'axios';

import { API_URL as ENV_API_URL } from '@env';

export const API_URL = ENV_API_URL || 'http://192.168.1.53:3001/dev'; 

export const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
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
