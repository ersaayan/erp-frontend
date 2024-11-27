import { create } from "zustand";
import { Bank } from "../types";

interface BankDialogStore {
  isOpen: boolean;
  editingBank: Bank | null;
  openDialog: (bank?: Bank) => void;
  closeDialog: () => void;
}

export const useBankDialog = create<BankDialogStore>((set) => ({
  isOpen: false,
  editingBank: null,
  openDialog: (bank) => set({ isOpen: true, editingBank: bank }),
  closeDialog: () => set({ isOpen: false, editingBank: null }),
}));
