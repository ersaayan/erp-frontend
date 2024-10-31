'use client';

import { create } from 'zustand';

interface CategoryDialogStore {
    isOpen: boolean;
    openDialog: () => void;
    closeDialog: () => void;
}

export const useCategoryDialog = create<CategoryDialogStore>((set) => ({
    isOpen: false,
    openDialog: () => set({ isOpen: true }),
    closeDialog: () => set({ isOpen: false }),
}));