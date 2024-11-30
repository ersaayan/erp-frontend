import { create } from "zustand";

interface BankTransferDialogStore {
    isOpen: boolean;
    openDialog: () => void;
    closeDialog: () => void;
}

export const useBankTransferDialog = create<BankTransferDialogStore>((set) => ({
    isOpen: false,
    openDialog: () => set({ isOpen: true }),
    closeDialog: () => set({ isOpen: false }),
}));