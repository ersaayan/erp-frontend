import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CashTransactionForm from "./CashTransactionForm";
import { useCashTransactionDialog } from "./useCashTransactionDialog";
import { Vault } from "../types";

interface CashTransactionDialogProps {
  vault: Vault | null;
}

const CashTransactionDialog: React.FC<CashTransactionDialogProps> = ({
  vault,
}) => {
  const { isOpen, type, closeDialog } = useCashTransactionDialog();

  if (!type || !vault) return null;

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === "income" ? "Kasa Giriş" : "Kasa Çıkış"} İşlemi
          </DialogTitle>
        </DialogHeader>
        <CashTransactionForm vault={vault} type={type} onClose={closeDialog} />
      </DialogContent>
    </Dialog>
  );
};

export default CashTransactionDialog;
