import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import VaultForm from "./VaultForm";
import { useVaultDialog } from "./useVaultDialog";

const VaultDialog: React.FC = () => {
  const { isOpen, closeDialog, editingVault } = useVaultDialog();

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingVault ? "Kasa Düzenle" : "Yeni Kasa Ekle"}
          </DialogTitle>
        </DialogHeader>
        <VaultForm vault={editingVault} onClose={closeDialog} />
      </DialogContent>
    </Dialog>
  );
};

export default VaultDialog;
