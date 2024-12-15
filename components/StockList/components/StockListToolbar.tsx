import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, RefreshCw, Settings, Upload, CheckSquare } from "lucide-react";

interface StockListToolbarProps {
  quickFilterText: string;
  onQuickFilterChange: (value: string) => void;
  onApplyQuickFilter: () => void;
  onClearFilter: () => void;
  onRefresh: () => void;
  onImport: () => void;
  onSettingsOpen: () => void;
  onBulkActionsToggle: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const StockListToolbar: React.FC<StockListToolbarProps> = ({
  quickFilterText,
  onQuickFilterChange,
  onApplyQuickFilter,
  onClearFilter,
  onRefresh,
  onImport,
  onSettingsOpen,
  onBulkActionsToggle,
  fileInputRef,
}) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <Input
          placeholder="Hızlı arama..."
          value={quickFilterText}
          onChange={(e) => onQuickFilterChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onApplyQuickFilter()}
          className="max-w-xs"
        />
      </div>
      <Button variant="outline" size="sm" onClick={onClearFilter}>
        <Filter className="h-4 w-4 mr-2" />
        Filtreleri Temizle
      </Button>
      <Button variant="outline" size="sm" onClick={onRefresh}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Yenile
      </Button>
      <Button variant="outline" size="sm" onClick={onImport}>
        <Upload className="h-4 w-4 mr-2" />
        İçeri Aktar
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={onImport}
        accept=".xlsx,.xls"
        className="hidden"
      />
      <Button variant="outline" size="sm" onClick={onSettingsOpen}>
        <Settings className="h-4 w-4 mr-2" />
        Ayarlar
      </Button>
      <Button variant="outline" size="sm" onClick={onBulkActionsToggle}>
        <CheckSquare className="h-4 w-4 mr-2" />
        Toplu İşlemler
      </Button>
    </div>
  );
};

export default StockListToolbar;
