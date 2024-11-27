import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TransferForm from "./TransferForm";
import { useTransferDialog } from "./useTransferDialog";
import { Vault } from "../types";

interface TransferDialogProps {
  sourceVault: Vault;
}

const TransferDialog: React.FC<TransferDialogProps> = ({ sourceVault }) => {
  const { isOpen, closeDialog } = useTransferDialog();

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Para Transferi</DialogTitle>
        </DialogHeader>
        <TransferForm sourceVault={sourceVault} onClose={closeDialog} />
      </DialogContent>
    </Dialog>
  );
};

export default TransferDialog;
