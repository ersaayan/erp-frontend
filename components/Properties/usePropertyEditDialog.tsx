"use client";

import { create } from "zustand";

interface Property {
  name: string;
  values: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface PropertyEditDialogStore {
  isOpen: boolean;
  editingProperty: Property | null;
  openDialog: (property: Property) => void;
  closeDialog: () => void;
}

export const usePropertyEditDialog = create<PropertyEditDialogStore>((set) => ({
  isOpen: false,
  editingProperty: null,
  openDialog: (property) => set({ isOpen: true, editingProperty: property }),
  closeDialog: () => set({ isOpen: false, editingProperty: null }),
}));
