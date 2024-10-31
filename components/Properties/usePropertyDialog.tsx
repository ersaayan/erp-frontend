'use client';

import { create } from 'zustand';

interface Property {
    id: number;
    name: string;
    values: string[];
    createdAt: Date;
    updatedAt: Date;
}

interface PropertyDialogStore {
    isOpen: boolean;
    editingProperty: Property | null;
    openDialog: (property?: Property | null) => void;
    closeDialog: () => void;
}

export const usePropertyDialog = create<PropertyDialogStore>((set) => ({
    isOpen: false,
    editingProperty: null,
    openDialog: (property = null) => set({ isOpen: true, editingProperty: property }),
    closeDialog: () => set({ isOpen: false, editingProperty: null }),
}));