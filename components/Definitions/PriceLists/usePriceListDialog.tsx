import { create } from "zustand";
import { PriceList } from "./types";

interface PriceListDialogStore {
  isOpen: boolean;
  editingPriceList: PriceList | null;
  openDialog: (priceList?: PriceList) => void;
  closeDialog: () => void;
}

export const usePriceListDialog = create<PriceListDialogStore>((set) => ({
  isOpen: false,
  editingPriceList: null,
  openDialog: (priceList = null) => set({ isOpen: true, editingPriceList: priceList }),
  closeDialog: () => set({ isOpen: false, editingPriceList: null }),
}));