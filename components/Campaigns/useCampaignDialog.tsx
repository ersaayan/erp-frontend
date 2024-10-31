'use client';

import { create } from 'zustand';

interface CampaignDialogStore {
    isOpen: boolean;
    openDialog: () => void;
    closeDialog: () => void;
}

export const useCampaignDialog = create<CampaignDialogStore>((set) => ({
    isOpen: false,
    openDialog: () => set({ isOpen: true }),
    closeDialog: () => set({ isOpen: false }),
}));