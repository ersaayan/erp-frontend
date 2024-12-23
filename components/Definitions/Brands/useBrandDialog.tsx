import { create } from "zustand";
import { Brand } from "./types";

interface BrandDialogStore {
  isOpen: boolean;
  editingBrand: Brand | null;
  openDialog: (brand?: Brand) => void;
  closeDialog: () => void;
}

export const useBrandDialog = create<BrandDialogStore>((set) => ({
  isOpen: false,
  editingBrand: null,
  openDialog: (brand = null) => set({ isOpen: true, editingBrand: brand }),
  closeDialog: () => set({ isOpen: false, editingBrand: null }),
}));