import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.13:3001/dev';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed from localStorage or Zustand
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors like 401 Unauthorized
    if (error.response?.status === 401) {
       // logic to redirect to login or clear store
    }
    return Promise.reject(error);
  }
);
