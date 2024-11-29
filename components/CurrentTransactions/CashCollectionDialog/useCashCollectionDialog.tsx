import { create } from "zustand";

interface CashCollectionDialogStore {
    isOpen: boolean;
    openDialog: () => void;
    closeDialog: () => void;
}

export const useCashCollectionDialog = create<CashCollectionDialogStore>(
    (set) => ({
        isOpen: false,
        openDialog: () => set({ isOpen: true }),
        closeDialog: () => set({ isOpen: false }),
    })
);