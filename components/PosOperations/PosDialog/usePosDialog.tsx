import { create } from "zustand";
import { Pos } from "../types";

interface PosDialogStore {
  isOpen: boolean;
  editingPos: Pos | null;
  openDialog: (pos?: Pos) => void;
  closeDialog: () => void;
}

export const usePosDialog = create<PosDialogStore>((set) => ({
  isOpen: false,
  editingPos: null,
  openDialog: (pos) => set({ isOpen: true, editingPos: pos }),
  closeDialog: () => set({ isOpen: false, editingPos: null }),
}));
