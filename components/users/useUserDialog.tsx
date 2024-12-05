"use client";

import { create } from "zustand";
import { User } from "./types";

interface UserDialogStore {
  isOpen: boolean;
  editingUser: User | null;
  openDialog: (user?: User) => void;
  closeDialog: () => void;
}

export const useUserDialog = create<UserDialogStore>((set) => ({
  isOpen: false,
  editingUser: null,
  openDialog: (user = null) => set({ isOpen: true, editingUser: user }),
  closeDialog: () => set({ isOpen: false, editingUser: null }),
}));
