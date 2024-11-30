import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import BankTransferForm from "./BankTransferForm";
import { useBankTransferDialog } from "./useBankTransferDialog";
import { Current } from "../types";

interface BankTransferDialogProps {
    current: Current | null;
}

const BankTransferDialog: React.FC<BankTransferDialogProps> = ({
                                                                   current,
                                                               }) => {
    const { isOpen, closeDialog } = useBankTransferDialog();

    if (!current) return null;

    return (
        <Dialog open={isOpen} onOpenChange={closeDialog}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Havale/EFT Tahsilat</DialogTitle>
                </DialogHeader>
                <BankTransferForm current={current} onClose={closeDialog} />
            </DialogContent>
        </Dialog>
    );
};

export default BankTransferDialog;