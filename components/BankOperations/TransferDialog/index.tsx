import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TransferForm from "./TransferForm";
import { useTransferDialog } from "./useTransferDialog";
import { Bank } from "../types";

interface TransferDialogProps {
  sourceBank: Bank | null;
}

const TransferDialog: React.FC<TransferDialogProps> = ({ sourceBank }) => {
  const { isOpen, closeDialog } = useTransferDialog();

  if (!sourceBank) return null;

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Para Transferi</DialogTitle>
        </DialogHeader>
        <TransferForm sourceBank={sourceBank} onClose={closeDialog} />
      </DialogContent>
    </Dialog>
  );
};

export default TransferDialog;
