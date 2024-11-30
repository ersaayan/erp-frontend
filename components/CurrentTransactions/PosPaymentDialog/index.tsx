import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import PosPaymentForm from "./PosPaymentForm";
import { usePosPaymentDialog } from "./usePosPaymentDialog";
import { Current } from "../types";

interface PosPaymentDialogProps {
    current: Current | null;
}

const PosPaymentDialog: React.FC<PosPaymentDialogProps> = ({
                                                               current,
                                                           }) => {
    const { isOpen, closeDialog } = usePosPaymentDialog();

    if (!current) return null;

    return (
        <Dialog open={isOpen} onOpenChange={closeDialog}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>POS Ödeme</DialogTitle>
                </DialogHeader>
                <PosPaymentForm current={current} onClose={closeDialog} />
            </DialogContent>
        </Dialog>
    );
};

export default PosPaymentDialog;