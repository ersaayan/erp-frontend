import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import PosOperationsToolbar from "./PosOperationsToolbar";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import PosGrid from "./PosGrid";
import PosMovementsGrid from "./PosMovementsGrid";
import { Pos } from "./types";

const PosOperations: React.FC = () => {
  const [selectedPos, setSelectedPos] = useState<Pos | null>(null);
  const [showAllMovements, setShowAllMovements] = useState(false);

  const handlePosSelect = (pos: Pos) => {
    setSelectedPos(pos);
    setShowAllMovements(false);
  };

  const handleShowAllMovements = () => {
    setSelectedPos(null);
    setShowAllMovements(true);
  };

  return (
    <div className="grid-container">
      <PosOperationsToolbar
        onShowAllMovements={handleShowAllMovements}
        selectedPos={selectedPos}
      />
      <Card className="mt-4 p-6">
        <ResizablePanelGroup
          direction="horizontal"
          className="min-h-[calc(100vh-12rem)] rounded-lg"
        >
          <ResizablePanel defaultSize={40}>
            <Card className="h-full p-4 border-0 shadow-none">
              <h2 className="text-lg font-semibold mb-4">POS Cihazları</h2>
              <PosGrid onPosSelect={handlePosSelect} />
            </Card>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={60}>
            <Card className="h-full p-4 border-0 shadow-none">
              <h2 className="text-lg font-semibold mb-4">
                {selectedPos
                  ? `${selectedPos.posName} - Hareketler`
                  : "Tüm Hareketler"}
              </h2>
              <PosMovementsGrid
                selectedPos={selectedPos}
                showAllMovements={showAllMovements}
              />
            </Card>
          </ResizablePanel>
        </ResizablePanelGroup>
      </Card>
    </div>
  );
};

export default PosOperations;
