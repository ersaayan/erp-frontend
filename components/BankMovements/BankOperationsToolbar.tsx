"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { List, RefreshCw, Check, ChevronsUpDown } from "lucide-react";
import { Bank } from "./types";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
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

interface BankOperationsToolbarProps {
  onShowAllMovements: () => void;
  selectedBank: Bank | null;
  onBankSelect: (bank: Bank | null) => void;
}

const BankOperationsToolbar: React.FC<BankOperationsToolbarProps> = ({
  onShowAllMovements,
  selectedBank,
  onBankSelect,
}) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [banks, setBanks] = useState<Bank[]>([]);

  useEffect(() => {
    // Bankaları getir
    const fetchBanks = async () => {
      try {
        const response = await fetch("/banks");
        const data = await response.json();
        setBanks(data);
      } catch (error) {
        console.error("Bankalar yüklenirken hata oluştu:", error);
      }
    };
    fetchBanks();
  }, []);

  const handleRefresh = () => {
    window.dispatchEvent(new CustomEvent("refreshBankOperations"));
    toast({
      title: "Success",
      description: "Veriler başarıyla yenilendi",
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center h-10">
        <div className="flex items-center space-x-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-[250px] justify-between"
              >
                {selectedBank ? selectedBank.bankName : "Banka Seçin"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0">
              <Command>
                <CommandInput placeholder="Banka Ara..." />
                <CommandEmpty>Banka bulunamadı.</CommandEmpty>
                <CommandGroup>
                  {banks.map((bank) => (
                    <CommandItem
                      key={bank.id}
                      value={bank.bankName}
                      onSelect={() => {
                        onBankSelect(bank);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedBank?.id === bank.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {bank.bankName}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="default"
            onClick={handleRefresh}
            className="min-w-[120px]"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </Button>

          <Button
            variant="default"
            size="default"
            onClick={onShowAllMovements}
            className="bg-[#84CC16] hover:bg-[#65A30D] min-w-[140px]"
          >
            <List className="h-4 w-4 mr-2" />
            Tüm Hareketler
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BankOperationsToolbar;
