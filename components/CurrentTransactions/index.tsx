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

const CurrentTransactions: React.FC = () => {
  const [selectedCurrent, setSelectedCurrent] = useState<Current | null>(null);

  const handleCurrentSelect = (current: Current) => {
    setSelectedCurrent(current);
  };

  return (
    <div className="grid-container">
      <CurrentTransactionsToolbar selectedCurrent={selectedCurrent} />
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
    </div>
  );
};

export default CurrentTransactions;
