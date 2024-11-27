import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BankForm from "./BankForm";
import { useBankDialog } from "./useBankDialog";

const BankDialog: React.FC = () => {
  const { isOpen, closeDialog, editingBank } = useBankDialog();

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingBank ? "Banka Düzenle" : "Yeni Banka Ekle"}
          </DialogTitle>
        </DialogHeader>
        <BankForm bank={editingBank} onClose={closeDialog} />
      </DialogContent>
    </Dialog>
  );
};

export default BankDialog;
