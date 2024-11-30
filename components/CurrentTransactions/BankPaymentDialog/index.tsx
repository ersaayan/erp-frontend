import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import BankPaymentForm from "./BankPaymentForm";
import { useBankPaymentDialog } from "./useBankPaymentDialog";
import { Current } from "../types";

interface BankPaymentDialogProps {
    current: Current | null;
}

const BankPaymentDialog: React.FC<BankPaymentDialogProps> = ({
                                                                 current,
                                                             }) => {
    const { isOpen, closeDialog } = useBankPaymentDialog();

    if (!current) return null;

    return (
        <Dialog open={isOpen} onOpenChange={closeDialog}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Havale/EFT Ödeme</DialogTitle>
                </DialogHeader>
                <BankPaymentForm current={current} onClose={closeDialog} />
            </DialogContent>
        </Dialog>
    );
};

export default BankPaymentDialog;