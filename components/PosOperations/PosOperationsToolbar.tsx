"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { List, Plus } from "lucide-react";
import { Pos } from "./types";
import { usePosDialog } from "./PosDialog/usePosDialog";
import PosDialog from "./PosDialog";

interface PosOperationsToolbarProps {
  onShowAllMovements: () => void;
  selectedPos: Pos | null;
}
const PosOperationsToolbar: React.FC<PosOperationsToolbarProps> = ({
  onShowAllMovements,
  selectedPos,
}) => {
  const { openDialog } = usePosDialog();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          className="bg-[#84CC16] hover:bg-[#65A30D]"
          onClick={() => openDialog()}
        >
          <Plus className="h-4 w-4 mr-2" />
          POS Ekle
        </Button>

        <Button
          variant="default"
          size="sm"
          onClick={onShowAllMovements}
          className="bg-[#84CC16] hover:bg-[#65A30D]"
        >
          <List className="h-4 w-4 mr-2" />
          Tüm Hareketler
        </Button>
      </div>

      <PosDialog />
    </div>
  );
};

export default PosOperationsToolbar;
