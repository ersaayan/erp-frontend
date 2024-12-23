"use client";

import { create } from "zustand";
import { Branch } from "./types";

interface BranchDialogStore {
    isOpen: boolean;
    editingBranch: Branch | null;
    openDialog: (branch?: Branch) => void;
    closeDialog: () => void;
}

export const useBranchDialog = create<BranchDialogStore>((set) => ({
    isOpen: false,
    editingBranch: null,
    openDialog: (branch = null) => set({ isOpen: true, editingBranch: branch }),
    closeDialog: () => set({ isOpen: false, editingBranch: null }),
}));