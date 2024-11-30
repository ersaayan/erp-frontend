import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import CashPaymentForm from "./CashPaymentForm";
import { useCashPaymentDialog } from "./useCashPaymentDialog";
import { Current } from "../types";

interface CashPaymentDialogProps {
    current: Current | null;
}

const CashPaymentDialog: React.FC<CashPaymentDialogProps> = ({
                                                                 current,
                                                             }) => {
    const { isOpen, closeDialog } = useCashPaymentDialog();

    if (!current) return null;

    return (
        <Dialog open={isOpen} onOpenChange={closeDialog}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Nakit Ödeme</DialogTitle>
                </DialogHeader>
                <CashPaymentForm current={current} onClose={closeDialog} />
            </DialogContent>
        </Dialog>
    );
};

export default CashPaymentDialog;