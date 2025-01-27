"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { List, RefreshCw } from "lucide-react";
import { Bank } from "./types";
import { useToast } from "@/hooks/use-toast";

interface BankOperationsToolbarProps {
  onShowAllMovements: () => void;
  selectedBank: Bank | null;
}

const BankOperationsToolbar: React.FC<BankOperationsToolbarProps> = ({
  onShowAllMovements,
}) => {
  const { toast } = useToast();

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
