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
import { useEffect } from "react";

const BankOperations: React.FC = () => {
  const [selectedBank, setSelectedBank] = useState<Bank | null>(() => {
    // Sayfa yüklendiğinde localStorage'dan seçili bankayı al
    if (typeof window !== "undefined") {
      const savedBank = localStorage.getItem("selectedBank");
      return savedBank ? JSON.parse(savedBank) : null;
    }
    return null;
  });
  const [showAllMovements, setShowAllMovements] = useState(false);

  const handleBankSelect = (bank: Bank) => {
    // Seçili bankayı localStorage'a kaydet
    localStorage.setItem("selectedBank", JSON.stringify(bank));
    setSelectedBank(bank);
    setShowAllMovements(false);
  };

  const handleShowAllMovements = () => {
    // Tüm hareketler görüntülenirken seçili bankayı temizle
    localStorage.removeItem("selectedBank");
    setSelectedBank(null);
    setShowAllMovements(true);
  };

  // Component unmount olduğunda seçili bankayı temizle
  useEffect(() => {
    return () => {
      localStorage.removeItem("selectedBank");
    };
  }, []);
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
          <ResizablePanel defaultSize={40}>
            <Card className="h-full p-4 border-0 shadow-none">
              <h2 className="text-lg font-semibold mb-4">Bankalar</h2>
              <BanksGrid onBankSelect={handleBankSelect} />
            </Card>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={60}>
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
