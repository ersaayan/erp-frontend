"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { List, Search } from "lucide-react";
import { Pos } from "./types";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

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
  const [open, setOpen] = useState(false);
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

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end items-center gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[250px] justify-between"
            >
              {selectedPos ? selectedPos.posName : "POS Seçiniz..."}
              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0">
            <Command>
              <CommandInput placeholder="POS Arayın..." />
              <CommandEmpty>POS bulunamadı.</CommandEmpty>
              <CommandGroup>
                {posList.map((pos) => (
                  <CommandItem
                    key={pos.id}
                    value={pos.posName}
                    onSelect={() => {
                      onPosSelect(pos);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedPos?.id === pos.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {pos.posName}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

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
