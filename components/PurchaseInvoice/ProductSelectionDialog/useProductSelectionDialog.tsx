import { create } from "zustand";

interface ProductSelectionDialogStore {
  isOpen: boolean;
  openDialog: () => void;
  closeDialog: () => void;
}

export const useProductSelectionDialog = create<ProductSelectionDialogStore>(
  (set) => ({
    isOpen: false,
    openDialog: () => set({ isOpen: true }),
    closeDialog: () => set({ isOpen: false }),
  })
);
