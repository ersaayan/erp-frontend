"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import CurrentTransactionsToolbar from "./CurrentTransactionsToolbar";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import CurrentsGrid from "./CurrentsGrid";
import CurrentMovementsGrid from "./CurrentMovementsGrid";
import { Current } from "./types";
import CashCollectionDialog from "./CashCollectionDialog";
import CashPaymentDialog from "./CashPaymentDialog";
import BankTransferDialog from "./BankTransferDialog";
import BankPaymentDialog from "./BankPaymentDialog";
import PosCollectionDialog from "./PosCollectionDialog";
import PosPaymentDialog from "./PosPaymentDialog";

interface CurrentTransactionsProps {
  onMenuItemClick: (itemName: string) => void;
}

const CurrentTransactions: React.FC<CurrentTransactionsProps> = ({
  onMenuItemClick,
}) => {
  const [selectedCurrent, setSelectedCurrent] = useState<Current | null>(() => {
    // Sayfa yüklendiğinde localStorage'dan seçili cariyi al
    if (typeof window !== "undefined") {
      const savedCurrent = localStorage.getItem("selectedCurrent");
      return savedCurrent ? JSON.parse(savedCurrent) : null;
    }
    return null;
  });

  const handleCurrentSelect = (current: Current) => {
    // Seçili cariyi localStorage'a kaydet
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
    </div>
  );
};

export default CurrentTransactions;
