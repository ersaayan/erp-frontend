import { RefreshCw, Search } from "lucide-react";
import { StockTakeStatus, StockTakeType } from "./types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MovementsToolbarProps {
  onRefresh: () => void;
  onSearch: (value: string) => void;
  onFilterStatus: (status: StockTakeStatus | "") => void;
  onFilterType: (type: StockTakeType | "") => void;
}

const MovementsToolbar = ({
  onRefresh,
  onSearch,
  onFilterStatus,
  onFilterType,
}: MovementsToolbarProps) => {
  return (
    <div className="flex items-center gap-4 border-b p-4">
      <div className="relative w-[300px]">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Ara..."
          onChange={(e) => onSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      <Select
        onValueChange={(value) =>
          onFilterStatus(value === "all" ? "" : (value as StockTakeStatus))
        }
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Durum Filtrele" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tümü</SelectItem>
          <SelectItem value="Completed">Tamamlandı</SelectItem>
          <SelectItem value="InProgress">Devam Ediyor</SelectItem>
          <SelectItem value="Cancelled">İptal Edildi</SelectItem>
          <SelectItem value="Draft">Taslak</SelectItem>
        </SelectContent>
      </Select>

      <Select
        onValueChange={(value) =>
          onFilterType(value === "all" ? "" : (value as StockTakeType))
        }
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Tip Filtrele" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tümü</SelectItem>
          <SelectItem value="Full">Tam Sayım</SelectItem>
          <SelectItem value="Partial">Kısmi Sayım</SelectItem>
          <SelectItem value="Spot">Spot Sayım</SelectItem>
          <SelectItem value="Periodic">Periyodik Sayım</SelectItem>
        </SelectContent>
      </Select>

      <div className="ml-auto">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Yenile</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default MovementsToolbar;
