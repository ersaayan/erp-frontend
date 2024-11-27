"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import BankOperationsToolbar from "./BankOperationsToolbar";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import BanksGrid from "./BanksGrid";
import BankMovementsGrid from "./BankMovementsGrid";
import { Bank } from "./types";

const BankOperations: React.FC = () => {
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [showAllMovements, setShowAllMovements] = useState(false);

  const handleBankSelect = (bank: Bank) => {
    setSelectedBank(bank);
    setShowAllMovements(false);
  };

  const handleShowAllMovements = () => {
    setSelectedBank(null);
    setShowAllMovements(true);
  };

  return (
    <div className="grid-container">
      <BankOperationsToolbar
        onShowAllMovements={handleShowAllMovements}
        selectedBank={selectedBank}
      />
      <Card className="mt-4 p-6">
        <ResizablePanelGroup
          direction="horizontal"
          className="min-h-[calc(100vh-12rem)] rounded-lg"
        >
          <ResizablePanel defaultSize={35}>
            <Card className="h-full p-4 border-0 shadow-none">
              <h2 className="text-lg font-semibold mb-4">Bankalar</h2>
              <BanksGrid onBankSelect={handleBankSelect} />
            </Card>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={65}>
            <Card className="h-full p-4 border-0 shadow-none">
              <h2 className="text-lg font-semibold mb-4">
                {selectedBank
                  ? `${selectedBank.bankName} - Hareketler`
                  : "Tüm Hareketler"}
              </h2>
              <BankMovementsGrid
                selectedBank={selectedBank}
                showAllMovements={showAllMovements}
              />
            </Card>
          </ResizablePanel>
        </ResizablePanelGroup>
      </Card>
    </div>
  );
};

export default BankOperations;
