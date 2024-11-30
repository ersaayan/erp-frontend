import { create } from "zustand";

interface PosPaymentDialogStore {
    isOpen: boolean;
    openDialog: () => void;
    closeDialog: () => void;
}

export const usePosPaymentDialog = create<PosPaymentDialogStore>((set) => ({
    isOpen: false,
    openDialog: () => set({ isOpen: true }),
    closeDialog: () => set({ isOpen: false }),
}));