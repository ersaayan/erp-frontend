"use client";

import { create } from "zustand";

interface CurrentCategoryDialogStore {
  isOpen: boolean;
  openDialog: () => void;
  closeDialog: () => void;
}

export const useCurrentCategoryDialog = create<CurrentCategoryDialogStore>(
  (set) => ({
    isOpen: false,
    openDialog: () => set({ isOpen: true }),
    closeDialog: () => set({ isOpen: false }),
  })
);
