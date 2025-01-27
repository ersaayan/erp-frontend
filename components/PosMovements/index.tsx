import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import PosOperationsToolbar from "./PosOperationsToolbar";
import PosMovementsGrid from "./PosMovementsGrid";
import { Pos } from "./types";

const PosOperations: React.FC = () => {
  const [selectedPos, setSelectedPos] = useState<Pos | null>(() => {
    if (typeof window !== "undefined") {
      const savedPos = localStorage.getItem("selectedPos");
      return savedPos ? JSON.parse(savedPos) : null;
    }
    return null;
  });
  const [showAllMovements, setShowAllMovements] = useState(false);

  const handlePosSelect = (pos: Pos | null) => {
    localStorage.setItem("selectedPos", pos ? JSON.stringify(pos) : "");
    setSelectedPos(pos);
    setShowAllMovements(!pos);
  };

  const handleShowAllMovements = () => {
    localStorage.removeItem("selectedPos");
    setSelectedPos(null);
    setShowAllMovements(true);
  };

  return (
    <div className="grid-container">
      <PosOperationsToolbar
        onShowAllMovements={handleShowAllMovements}
        onPosSelect={handlePosSelect}
        selectedPos={selectedPos}
      />
      <Card className="mt-4 p-6">
        <div className="min-h-[calc(100vh-12rem)]">
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
        </div>
      </Card>
    </div>
  );
};

export default PosOperations;
