import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import CashCollectionForm from "./CashCollectionForm";
import { useCashCollectionDialog } from "./useCashCollectionDialog";
import { Current } from "../types";

interface CashCollectionDialogProps {
    current: Current | null;
}

const CashCollectionDialog: React.FC<CashCollectionDialogProps> = ({
                                                                       current,
                                                                   }) => {
    const { isOpen, closeDialog } = useCashCollectionDialog();

    if (!current) return null;

    return (
        <Dialog open={isOpen} onOpenChange={closeDialog}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Nakit Tahsilat</DialogTitle>
                </DialogHeader>
                <CashCollectionForm current={current} onClose={closeDialog} />
            </DialogContent>
        </Dialog>
    );
};

export default CashCollectionDialog;