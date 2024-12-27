import { create } from "zustand";

interface BankPaymentDialogStore {
  isOpen: boolean;
  openDialog: () => void;
  closeDialog: () => void;
}

export const useBankPaymentDialog = create<BankPaymentDialogStore>((set) => ({
  isOpen: false,
  openDialog: () => set({ isOpen: true }),
  closeDialog: () => set({ isOpen: false }),
}));
