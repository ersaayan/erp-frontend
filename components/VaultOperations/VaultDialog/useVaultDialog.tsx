import { create } from "zustand";
import { Vault } from "../types";

interface VaultDialogStore {
  isOpen: boolean;
  editingVault: Vault | null;
  openDialog: (vault?: Vault) => void;
  closeDialog: () => void;
}

export const useVaultDialog = create<VaultDialogStore>((set) => ({
  isOpen: false,
  editingVault: null,
  openDialog: (vault) => set({ isOpen: true, editingVault: vault }),
  closeDialog: () => set({ isOpen: false, editingVault: null }),
}));
