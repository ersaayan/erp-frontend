"use client";

import { create } from "zustand";
import { Warehouse } from "./types";

interface WarehouseDialogStore {
  isOpen: boolean;
  editingWarehouse: Warehouse | null;
  openDialog: (warehouse?: Warehouse) => void;
  closeDialog: () => void;
}

export const useWarehouseDialog = create<WarehouseDialogStore>((set) => ({
  isOpen: false,
  editingWarehouse: null,
  openDialog: (warehouse = null) =>
    set({ isOpen: true, editingWarehouse: warehouse }),
  closeDialog: () => set({ isOpen: false, editingWarehouse: null }),
}));
