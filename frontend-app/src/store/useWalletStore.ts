import { create } from 'zustand';
import { client } from '../api/client';
import { AuthService } from '../services/AuthService';
import { AnalyticsService } from '../services/AnalyticsService';

interface Transaction {
  id: string;
  amount: number;
  type: 'incoming' | 'outgoing';
  status: 'pending' | 'completed' | 'failed' | 'expired';
  date: string;
  description?: string;
  fiatAmount?: number;
  fiatCurrency?: string;
}

interface User {
  id: string;
  identity: string; // Previously email
  name?: string;
  walletId?: string;
  balance?: number;
}

interface WalletState {
  user: User | null;
  balance: number;
  transactions: Transaction[];
  btcPrice: number;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  
  // Actions
  boot: () => Promise<void>;
  syncBalance: () => Promise<void>;
  fetchPrice: () => Promise<void>;
  sendPayment: (invoice: string) => Promise<void>;
  generateInvoice: (amount: number, memo: string) => Promise<{ payment_request: string; checking_id: string }>;
  withdrawToNequi: (amount: number, phoneNumber: string) => Promise<void>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  user: null,
  balance: 0,
  transactions: [],
  btcPrice: 0,
  isLoading: false,
  isSyncing: false,
  error: null,

  boot: async () => {
    const { user, isSyncing } = get();
    if (user || isSyncing) return;

    set({ isSyncing: true, error: null });
    
    try {
        const identity = AuthService.getDeviceIdentity();
        const password = identity; // Simplified anonymous auth
        const name = AuthService.getDeviceName();

        console.log(`⚡ [WalletStore] Booting Biterva... ID: ${identity}`);

        // Fetch price in parallel
        get().fetchPrice();

        try {
            const res = await client.post('/login', { identity, password });
            set({ 
                user: res.data.user, 
                balance: res.data.user.balance,
                transactions: res.data.user.transactions || []
            });
            console.log('✅ [WalletStore] Session restored.');
            // Force a deep sync with LNBits to ensure balance is real
            get().syncBalance();
        } catch (e: any) {
            if (e.response && e.response.status === 401) {
                console.log('✨ [WalletStore] Provisioning new anonymous wallet...');
                const signupRes = await client.post('/signup', { identity, password, name });
                set({ user: signupRes.data.user, balance: 0 });
                console.log('✅ [WalletStore] Wallet provisioned.');
            } else {
                throw e;
            }
        }
    } catch (err: any) {
        console.error('❌ [WalletStore] Boot failed:', err.message);
        set({ error: 'Connection error. Retrying...' });
    } finally {
        set({ isSyncing: false });
    }
  },

  fetchPrice: async () => {
    try {
        const res = await client.get('/prices');
        set({ btcPrice: res.data.cop });
    } catch (e) {
        console.warn('⚠️ [WalletStore] Price fetch failed, using fallback');
        if (get().btcPrice === 0) set({ btcPrice: 400000000 });
    }
  },

  syncBalance: async () => {
    const { user } = get();
    if (!user) return;
    
    try {
      const res = await client.get(`/user?identity=${user.identity}`);
      const updatedUser = res.data;
      set({ 
        user: { ...user, ...updatedUser },
        balance: updatedUser.balance,
        transactions: updatedUser.transactions || []
      });
      // Also update price on balance sync
      get().fetchPrice();
    } catch (err) {
      console.warn('⚠️ [WalletStore] Balance sync failed');
    }
  },

  sendPayment: async (invoice) => {
    const { user } = get();
    if (!user) throw new Error("Wallet not initialized");
    
    set({ isLoading: true });
    try {
       await client.post('/pay', { 
           userId: user.id,
           invoice 
       });
       
       // Sincronización inmediata
       await get().syncBalance();
       
       // Sincronización de seguridad (GrowthHacking UX: asegurar que el saldo sea real)
       setTimeout(() => {
           get().syncBalance();
       }, 1500);

       AnalyticsService.logEvent('payment_sent');
    } catch (err: any) {
       throw err;
    } finally {
       set({ isLoading: false });
    }
  },

  generateInvoice: async (amount, memo) => {
    let { user } = get();
    
    if (!user && get().isSyncing) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        user = get().user;
    }
    
    if (!user) {
        await get().boot();
        user = get().user;
    }

    if (!user) throw new Error("Connection unstable. Please refresh the app.");
    
    set({ isLoading: true });
    try {
        const res = await client.post('/invoice', {
            amount,
            memo,
            userId: user.id 
        });
        return {
            payment_request: res.data.paymentRequest,
            checking_id: res.data.paymentHash
        }; 
    } catch (err: any) {
        console.error('❌ [WalletStore] Invoice creation failed', err.response?.data || err.message);
        throw err;
    } finally {
        set({ isLoading: false });
    }
  },

  withdrawToNequi: async (amount, phoneNumber) => {
     const { user } = get();
     if (!user) throw new Error("Wallet not initialized");
     set({ isLoading: true });
     try {
       await client.post('/withdraw-nequi', {
           userId: user.id,
           amountSats: amount,
           nequi: phoneNumber
       });
       AnalyticsService.logEvent('withdraw_nequi', { amount });
       await get().syncBalance();
     } catch (err: any) {
        console.error('❌ [WalletStore] Withdraw failed', err.response?.data || err.message);
        throw err;
     } finally {
         set({ isLoading: false });
     }
  }
}));
