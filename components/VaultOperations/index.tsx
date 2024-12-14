"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import VaultOperationsToolbar from "./VaultOperationsToolbar";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import VaultsGrid from "./VaultsGrid";
import VaultMovementsGrid from "./VaultMovementsGrid";
import { Vault } from "./types";

const VaultOperations: React.FC = () => {
  const [selectedVault, setSelectedVault] = useState<Vault | null>(() => {
    // Sayfa yüklendiğinde localStorage'dan seçili kasayı al
    if (typeof window !== "undefined") {
      const savedVault = localStorage.getItem("selectedVault");
      return savedVault ? JSON.parse(savedVault) : null;
    }
    return null;
  });
  const [showAllMovements, setShowAllMovements] = useState(false);

  const handleVaultSelect = (vault: Vault) => {
    // Seçili kasayı localStorage'a kaydet
    localStorage.setItem("selectedVault", JSON.stringify(vault));
    setSelectedVault(vault);
    setShowAllMovements(false);
  };

  const handleShowAllMovements = () => {
    // Tüm hareketler görüntülenirken seçili kasayı temizle
    localStorage.removeItem("selectedVault");
    setSelectedVault(null);
    setShowAllMovements(true);
  };

  return (
    <div className="grid-container">
      <VaultOperationsToolbar
        onShowAllMovements={handleShowAllMovements}
        selectedVault={selectedVault}
      />
      <Card className="mt-4 p-6">
        <ResizablePanelGroup
          direction="horizontal"
          className="min-h-[calc(100vh-12rem)] rounded-lg"
        >
          <ResizablePanel defaultSize={40}>
            <Card className="h-full p-4 border-0 shadow-none">
              <h2 className="text-lg font-semibold mb-4">Kasalar</h2>
              <VaultsGrid onVaultSelect={handleVaultSelect} />
            </Card>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={60}>
            <Card className="h-full p-4 border-0 shadow-none">
              <h2 className="text-lg font-semibold mb-4">
                {selectedVault
                  ? `${selectedVault.vaultName} - Hareketler`
                  : "Tüm Hareketler"}
              </h2>
              <VaultMovementsGrid
                selectedVault={selectedVault}
                showAllMovements={showAllMovements}
              />
            </Card>
          </ResizablePanel>
        </ResizablePanelGroup>
      </Card>
    </div>
  );
};

export default VaultOperations;
