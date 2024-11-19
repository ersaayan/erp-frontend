"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { useCurrentCategoryDialog } from "./useCurrentCategoryDialog";
import { useToast } from "@/hooks/use-toast";

const CurrentCategoriesToolbar: React.FC = () => {
  const { openDialog } = useCurrentCategoryDialog();
  const { toast } = useToast();

  const handleRefresh = async () => {
    try {
      // Trigger a refresh of the current categories list
      const refreshEvent = new CustomEvent("refreshCurrentCategories");
      window.dispatchEvent(refreshEvent);

      toast({
        title: "Success",
        description: "Current categories refreshed successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to refresh current categories",
      });
    }
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
        onClick={openDialog}
      >
        <Plus className="h-4 w-4 mr-2" />
        Kategori Ekle
      </Button>
    </div>
  );
};

export default CurrentCategoriesToolbar;
