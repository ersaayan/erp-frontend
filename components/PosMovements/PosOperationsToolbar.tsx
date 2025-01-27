"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { List } from "lucide-react";
import { Pos } from "./types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PosOperationsToolbarProps {
  onShowAllMovements: () => void;
  onPosSelect: (pos: Pos | null) => void;
  selectedPos: Pos | null;
}

const PosOperationsToolbar: React.FC<PosOperationsToolbarProps> = ({
  onShowAllMovements,
  onPosSelect,
  selectedPos,
}) => {
  const [posList, setPosList] = useState<Pos[]>([]);

  // TODO: Bu kısım API'den gelecek şekilde güncellenecek
  useEffect(() => {
    setPosList([
      {
        id: "1",
        posName: "POS 1",
        branchCode: "001",
        balance: "1000",
        currency: "TRY",
      },
      {
        id: "2",
        posName: "POS 2",
        branchCode: "002",
        balance: "2000",
        currency: "TRY",
      },
    ]);
  }, []);

  const handlePosChange = (value: string) => {
    if (value === "") {
      onPosSelect(null);
      return;
    }
    const selectedPos = posList.find((pos) => pos.id === value);
    if (selectedPos) {
      onPosSelect(selectedPos);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end items-center gap-2">
        <Select value={selectedPos?.id || ""} onValueChange={handlePosChange}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="POS Seçiniz..." />
          </SelectTrigger>
          <SelectContent>
            {posList.map((pos) => (
              <SelectItem key={pos.id} value={pos.id}>
                {pos.posName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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
    </div>
  );
};

export default PosOperationsToolbar;
