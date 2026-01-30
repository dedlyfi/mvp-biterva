import { create } from 'zustand';

export interface ModalConfig {
    visible: boolean;
    type: 'success' | 'error' | 'info' | 'insufficient_balance';
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
}

interface UIStore {
    modal: ModalConfig;
    showModal: (config: Omit<ModalConfig, 'visible'>) => void;
    hideModal: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
    modal: {
        visible: false,
        type: 'info',
        title: '',
        message: '',
    },
    showModal: (config) => set({ 
        modal: { ...config, visible: true } 
    }),
    hideModal: () => set((state) => ({ 
        modal: { ...state.modal, visible: false } 
    })),
}));
