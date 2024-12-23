"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { useBrandDialog } from "./useBrandDialog";
import { useToast } from "@/hooks/use-toast";

const BrandsToolbar: React.FC = () => {
  const { openDialog } = useBrandDialog();
  const { toast } = useToast();

  const handleRefresh = () => {
    window.dispatchEvent(new CustomEvent("refreshBrands"));
    toast({
      title: "Success",
      description: "Brands refreshed successfully",
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
        Marka Ekle
      </Button>
    </div>
  );
};

export default BrandsToolbar;