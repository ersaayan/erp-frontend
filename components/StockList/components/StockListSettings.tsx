import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StockListSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: {
    showGroupPanel: boolean;
    showFilterRow: boolean;
    showHeaderFilter: boolean;
    alternateRowColoring: boolean;
    pageSize: string;
    virtualScrolling: boolean;
  };
  onSettingsChange: (key: string, value: boolean | string) => void;
}

const StockListSettings: React.FC<StockListSettingsProps> = ({
  open,
  onOpenChange,
  settings,
  onSettingsChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Table Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="showGroupPanel">Show Group Panel</Label>
            <Switch
              id="showGroupPanel"
              checked={settings.showGroupPanel}
              onCheckedChange={(checked) =>
                onSettingsChange("showGroupPanel", checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="showFilterRow">Show Filter Row</Label>
            <Switch
              id="showFilterRow"
              checked={settings.showFilterRow}
              onCheckedChange={(checked) =>
                onSettingsChange("showFilterRow", checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="showHeaderFilter">Show Header Filter</Label>
            <Switch
              id="showHeaderFilter"
              checked={settings.showHeaderFilter}
              onCheckedChange={(checked) =>
                onSettingsChange("showHeaderFilter", checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="alternateRowColoring">Alternate Row Coloring</Label>
            <Switch
              id="alternateRowColoring"
              checked={settings.alternateRowColoring}
              onCheckedChange={(checked) =>
                onSettingsChange("alternateRowColoring", checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="virtualScrolling">Virtual Scrolling</Label>
            <Switch
              id="virtualScrolling"
              checked={settings.virtualScrolling}
              onCheckedChange={(checked) =>
                onSettingsChange("virtualScrolling", checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="pageSize">Page Size</Label>
            <Select
              value={settings.pageSize}
              onValueChange={(value) => onSettingsChange("pageSize", value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select page size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 rows</SelectItem>
                <SelectItem value="25">25 rows</SelectItem>
                <SelectItem value="50">50 rows</SelectItem>
                <SelectItem value="100">100 rows</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StockListSettings;
