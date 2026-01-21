import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

import { api } from './axios';

interface User {
  id: string;
  email: string;
  nequiNumber?: string;
}

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

interface WalletState {
  user: User | null;
  balance: number;
  transactions: Transaction[];
  isLoading: boolean;
  _hasHydrated: boolean;
  btcPrice: number;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, name: string, password: string) => Promise<void>;
  setHasHydrated: (state: boolean) => void;
  logout: () => void;
  fetchBalance: () => Promise<void>;
  fetchPrice: () => Promise<void>;
  addTransaction: (tx: Transaction) => void;
  setLoading: (loading: boolean) => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      user: null,
      balance: 0,
      transactions: [],
      isLoading: false,
      _hasHydrated: false,
      btcPrice: 0,



      login: async (email, password) => {
        set({ isLoading: true });
        try {
            const response = await api.post('/login', { email, password });
            const { user } = response.data;
            set({ user });
        } catch (error) {
            console.error(error);
            throw error;
        } finally {
            set({ isLoading: false });
        }
      },

      signup: async (email, name, password) => {
        set({ isLoading: true });
        try {
             const response = await api.post('/signup', { email, name, password });
             const { user } = response.data;
             // Auto-login after signup
             set({ user });
        } catch (error) {
             console.error(error);
             throw error;
        } finally {
            set({ isLoading: false });
        }
      },

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      logout: () => set({ user: null, balance: 0, transactions: [], btcPrice: 0 }),

      fetchPrice: async () => {
        try {
            const res = await api.get('/prices');
            set({ btcPrice: res.data.cop });
        } catch (e) {
            console.error("Price fetch failed", e);
            // Fallback if not already set (approx 400M COP)
            if (get().btcPrice === 0) set({ btcPrice: 400000000 });
        }
      },

      fetchBalance: async () => {
        const { user } = get();
        if (!user?.email) return;

        set({ isLoading: true });
        try {
          // Parallel fetch for speed
          const [userRes] = await Promise.all([
            api.get(`/user?email=${user.email}`),
            get().fetchPrice()
          ]);
          
          const updatedUser = userRes.data;
          set({ 
            balance: updatedUser.balance,
            transactions: updatedUser.transactions || [],
            user: { ...user, ...updatedUser } // Update user details too
          }); 
        } catch (error) {
          console.error('Failed to fetch balance:', error);
        } finally {
           set({ isLoading: false });
        }
      },

      addTransaction: (tx) => {
        set((state) => ({ transactions: [tx, ...state.transactions] }));
      },

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'biterva-storage',
      partialize: (state) => ({ user: state.user }), // Only persist user session
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
