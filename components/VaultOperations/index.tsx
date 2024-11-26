"use client";

import React, { useState } from "react";
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
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
  const [showAllMovements, setShowAllMovements] = useState(false);

  const handleVaultSelect = (vault: Vault) => {
    setSelectedVault(vault);
    setShowAllMovements(false);
  };

  const handleShowAllMovements = () => {
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
          <ResizablePanel defaultSize={35}>
            <Card className="h-full p-4 border-0 shadow-none">
              <h2 className="text-lg font-semibold mb-4">Kasalar</h2>
              <VaultsGrid onVaultSelect={handleVaultSelect} />
            </Card>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={65}>
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
