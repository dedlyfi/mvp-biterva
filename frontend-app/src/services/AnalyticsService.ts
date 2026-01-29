import axios from 'axios';
import { AuthService } from './AuthService';

import { GA_MEASUREMENT_ID } from '@env';

const MEASUREMENT_ID = GA_MEASUREMENT_ID || 'G-XXXXXXXXXX'; 
const API_SECRET = ''; // Optional specific secret if configured in GA4
const GA_ENDPOINT = `https://www.google-analytics.com/mp/collect?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`;

// We want to queue events or send immediately. For simplicity, send fire-and-forget.
export const AnalyticsService = {
  logEvent: async (eventName: string, params: Record<string, any> = {}) => {
    try {
      const clientId = AuthService.getDeviceIdentity();
      
      const payload = {
        client_id: clientId,
        events: [
          {
            name: eventName,
            params: {
              ...params,
              engagement_time_msec: '100',
              session_id: clientId, // simplified session tracking
            },
          },
        ],
      };

      await axios.post(GA_ENDPOINT, payload);
      console.log(`[Analytics] Sent event: ${eventName}`, params);
    } catch (error) {
      console.warn('[Analytics] Failed to send event', error);
    }
  },

  logScreenView: async (screenName: string) => {
    await AnalyticsService.logEvent('screen_view', {
      screen_name: screenName,
      screen_class: screenName,
    });
  },
};
