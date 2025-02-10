"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import CurrentTransactionsToolbar from "./CurrentTransactionsToolbar";
import CurrentMovementsGrid from "./CurrentMovementsGrid";
import { Current, CurrentMovement } from "./types";
import CashCollectionDialog from "./CashCollectionDialog";
import CashPaymentDialog from "./CashPaymentDialog";
import BankTransferDialog from "./BankTransferDialog";
import BankPaymentDialog from "./BankPaymentDialog";
import PosCollectionDialog from "./PosCollectionDialog";
import PosPaymentDialog from "./PosPaymentDialog";
import EditMovementDialog from "./EditMovementDialog";

interface CurrentTransactionsProps {
  onMenuItemClick: (itemName: string) => void;
}

interface CustomEventType extends Event {
  detail: {
    movement: CurrentMovement;
  };
}

const CurrentTransactions: React.FC<CurrentTransactionsProps> = ({
  onMenuItemClick,
}) => {
  const [selectedCurrent, setSelectedCurrent] = useState<Current | null>(() => {
    if (typeof window !== "undefined") {
      const savedCurrent = localStorage.getItem("selectedCurrent");
      return savedCurrent ? JSON.parse(savedCurrent) : null;
    }
    return null;
  });

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] =
    useState<CurrentMovement | null>(null);

  useEffect(() => {
    const handleOpenEditDialog = (event: CustomEventType) => {
      setSelectedMovement(event.detail.movement);
      setEditDialogOpen(true);
    };

    window.addEventListener(
      "openEditDialog",
      handleOpenEditDialog as EventListener
    );
    return () => {
      window.removeEventListener(
        "openEditDialog",
        handleOpenEditDialog as EventListener
      );
    };
  }, []);

  const handleCurrentSelect = (current: Current) => {
    localStorage.setItem("selectedCurrent", JSON.stringify(current));
    setSelectedCurrent(current);
  };

  return (
    <div className="grid-container">
      <CurrentTransactionsToolbar
        selectedCurrent={selectedCurrent}
        onCurrentSelect={handleCurrentSelect}
        onMenuItemClick={onMenuItemClick}
      />
      <Card className="mt-4 p-6">
        <div className="min-h-[calc(100vh-12rem)] rounded-lg">
          <Card className="h-full p-4 border-0 shadow-none">
            <h2 className="text-lg font-semibold mb-4">
              {selectedCurrent
                ? `${selectedCurrent.currentName} - Hareketler`
                : "Cari Hareketleri"}
            </h2>
            <CurrentMovementsGrid selectedCurrent={selectedCurrent} />
          </Card>
        </div>
      </Card>
      <CashCollectionDialog current={selectedCurrent} />
      <CashPaymentDialog current={selectedCurrent} />
      <BankTransferDialog current={selectedCurrent} />
      <BankPaymentDialog current={selectedCurrent} />
      <PosCollectionDialog current={selectedCurrent} />
      <PosPaymentDialog current={selectedCurrent} />
      <EditMovementDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        movement={selectedMovement}
        currentId={selectedCurrent?.id}
      />
    </div>
  );
};

export default CurrentTransactions;
