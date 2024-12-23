"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { usePriceListDialog } from "./usePriceListDialog";
import { useToast } from "@/hooks/use-toast";

const PriceListsToolbar: React.FC = () => {
  const { openDialog } = usePriceListDialog();
  const { toast } = useToast();

  const handleRefresh = () => {
    window.dispatchEvent(new CustomEvent("refreshPriceLists"));
    toast({
      title: "Success",
      description: "Price lists refreshed successfully",
    });
  };

  return (
    <div className="flex justify-end items-center gap-2">
      <Button variant="outline" size="sm" onClick={handleRefresh}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Yenile
      </Button>

      <Button
        variant="default"
        size="sm"
        className="bg-[#84CC16] hover:bg-[#65A30D]"
        onClick={() => openDialog()}
      >
        <Plus className="h-4 w-4 mr-2" />
        Fiyat Listesi Ekle
      </Button>
    </div>
  );
};

export default PriceListsToolbar;