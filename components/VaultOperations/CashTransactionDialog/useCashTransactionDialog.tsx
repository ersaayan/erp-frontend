import { create } from "zustand";

interface CashTransactionDialogStore {
  isOpen: boolean;
  type: "income" | "expense" | null;
  openDialog: (type: "income" | "expense") => void;
  closeDialog: () => void;
}

export const useCashTransactionDialog = create<CashTransactionDialogStore>(
  (set) => ({
    isOpen: false,
    type: null,
    openDialog: (type) => set({ isOpen: true, type }),
    closeDialog: () => set({ isOpen: false, type: null }),
  })
);
