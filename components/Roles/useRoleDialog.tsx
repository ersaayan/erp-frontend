// components/Roles/useRoleDialog.tsx
import { create } from "zustand";
import { Role } from "./types";

interface RoleDialogStore {
    isOpen: boolean;
    editingRole: Role | null;
    openDialog: (role?: Role) => void;
    closeDialog: () => void;
}

export const useRoleDialog = create<RoleDialogStore>((set) => ({
    isOpen: false,
    editingRole: null,
    openDialog: (role = null) => set({ isOpen: true, editingRole: role }),
    closeDialog: () => set({ isOpen: false, editingRole: null }),
}));
