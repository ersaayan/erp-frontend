import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PosForm from "./PosForm";
import { usePosDialog } from "./usePosDialog";

const PosDialog: React.FC = () => {
  const { isOpen, closeDialog, editingPos } = usePosDialog();

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingPos ? "POS Düzenle" : "Yeni POS Ekle"}
          </DialogTitle>
        </DialogHeader>
        <PosForm pos={editingPos} onClose={closeDialog} />
      </DialogContent>
    </Dialog>
  );
};

export default PosDialog;
