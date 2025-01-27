"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import BankOperationsToolbar from "./BankOperationsToolbar";
import BankMovementsGrid from "./BankMovementsGrid";
import { Bank } from "./types";

const BankOperations: React.FC = () => {
  const [selectedBank, setSelectedBank] = useState<Bank | null>(() => {
    if (typeof window !== "undefined") {
      const savedBank = localStorage.getItem("selectedBank");
      return savedBank ? JSON.parse(savedBank) : null;
    }
    return null;
  });
  const [showAllMovements, setShowAllMovements] = useState(false);

  const handleBankSelect = (bank: Bank | null) => {
    localStorage.setItem("selectedBank", bank ? JSON.stringify(bank) : "");
    setSelectedBank(bank);
    setShowAllMovements(!bank);
  };

  const handleShowAllMovements = () => {
    localStorage.removeItem("selectedBank");
    setSelectedBank(null);
    setShowAllMovements(true);
  };

  return (
    <div className="grid-container">
      <BankOperationsToolbar
        onShowAllMovements={handleShowAllMovements}
        selectedBank={selectedBank}
        onBankSelect={handleBankSelect}
      />
      <Card className="mt-4 p-6">
        <div className="min-h-[calc(100vh-12rem)] rounded-lg">
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
        </div>
      </Card>
    </div>
  );
};

export default BankOperations;
