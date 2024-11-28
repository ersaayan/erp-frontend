import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CashTransactionForm from "./CashTransactionForm";
import { useCashTransactionDialog } from "./useCashTransactionDialog";
import { Bank } from "../types";

interface CashTransactionDialogProps {
  bank: Bank | null;
}

const CashTransactionDialog: React.FC<CashTransactionDialogProps> = ({
  bank,
}) => {
  const { isOpen, type, closeDialog } = useCashTransactionDialog();

  if (!type || !bank) return null;

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === "income" ? "Kasa Giriş" : "Kasa Çıkış"} İşlemi
          </DialogTitle>
        </DialogHeader>
        <CashTransactionForm bank={bank} type={type} onClose={closeDialog} />
      </DialogContent>
    </Dialog>
  );
};

export default CashTransactionDialog;
