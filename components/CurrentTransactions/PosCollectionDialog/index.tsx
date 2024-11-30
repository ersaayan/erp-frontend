import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import PosCollectionForm from "./PosCollectionForm";
import { usePosCollectionDialog } from "./usePosCollectionDialog";
import { Current } from "../types";

interface PosCollectionDialogProps {
    current: Current | null;
}

const PosCollectionDialog: React.FC<PosCollectionDialogProps> = ({
                                                                     current,
                                                                 }) => {
    const { isOpen, closeDialog } = usePosCollectionDialog();

    if (!current) return null;

    return (
        <Dialog open={isOpen} onOpenChange={closeDialog}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>POS Tahsilat</DialogTitle>
                </DialogHeader>
                <PosCollectionForm current={current} onClose={closeDialog} />
            </DialogContent>
        </Dialog>
    );
};

export default PosCollectionDialog;