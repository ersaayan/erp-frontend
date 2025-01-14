"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import CurrentTransactionsToolbar from "./CurrentTransactionsToolbar";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import CurrentsGrid from "./CurrentsGrid";
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
    const handleOpenEditDialog = (
      event: CustomEvent<{ movement: CurrentMovement }>
    ) => {
      setSelectedMovement(event.detail.movement);
      setEditDialogOpen(true);
    };

    window.addEventListener("openEditDialog" as any, handleOpenEditDialog);
    return () => {
      window.removeEventListener("openEditDialog" as any, handleOpenEditDialog);
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
        onMenuItemClick={onMenuItemClick}
      />
      <Card className="mt-4 p-6">
        <ResizablePanelGroup
          direction="horizontal"
          className="min-h-[calc(100vh-12rem)] rounded-lg"
        >
          <ResizablePanel defaultSize={35}>
            <Card className="h-full p-4 border-0 shadow-none">
              <h2 className="text-lg font-semibold mb-4">Cariler</h2>
              <CurrentsGrid onCurrentSelect={handleCurrentSelect} />
            </Card>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={65}>
            <Card className="h-full p-4 border-0 shadow-none">
              <h2 className="text-lg font-semibold mb-4">
                {selectedCurrent
                  ? `${selectedCurrent.currentName} - Hareketler`
                  : "Cari Hareketleri"}
              </h2>
              <CurrentMovementsGrid selectedCurrent={selectedCurrent} />
            </Card>
          </ResizablePanel>
        </ResizablePanelGroup>
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
