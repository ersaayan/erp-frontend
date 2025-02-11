"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { usePropertyDialog } from "./usePropertyDialog";

interface PropertiesToolbarProps {
  onRefresh: () => Promise<void>;
}

const PropertiesToolbar: React.FC<PropertiesToolbarProps> = ({ onRefresh }) => {
  const { openDialog } = usePropertyDialog();

  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Yenile
        </Button>
      </div>
      <Button
        className="bg-[#84CC16] hover:bg-[#65A30D]"
        onClick={() => openDialog()}
      >
        <Plus className="h-4 w-4 mr-2" />
        Yeni Özellik
      </Button>
    </div>
  );
};

export default PropertiesToolbar;
