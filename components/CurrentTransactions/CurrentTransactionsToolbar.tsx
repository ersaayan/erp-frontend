"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  FileDown,
  FileUp,
  Wallet,
  CreditCard,
  ArrowLeftRight,
  RefreshCw,
} from "lucide-react";
import { Current } from "./types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface CurrentTransactionsToolbarProps {
  selectedCurrent: Current | null;
}

const CurrentTransactionsToolbar: React.FC<CurrentTransactionsToolbarProps> = ({
  selectedCurrent,
}) => {
  const { toast } = useToast();

  const handleRefresh = () => {
    // Trigger refresh events for both grids
    window.dispatchEvent(new CustomEvent("refreshCurrents"));
    window.dispatchEvent(new CustomEvent("refreshCurrentMovements"));

    toast({
      title: "Success",
      description: "Veriler başarıyla yenilendi",
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-[#84CC16] hover:bg-[#65A30D]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Yeni Cari
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </Button>
        </div>
      </div>

      {selectedCurrent && (
        <div className="flex gap-2 justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-blue-500 text-white hover:bg-blue-600"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Alış
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Alış Faturası</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-green-500 text-white hover:bg-green-600"
              >
                <FileUp className="h-4 w-4 mr-2" />
                Satış
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Satış Faturası</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-purple-500 text-white hover:bg-purple-600"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Tahsilat
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Nakit Tahsilat</DropdownMenuItem>
              <DropdownMenuItem>Havale/EFT Tahsilat</DropdownMenuItem>
              <DropdownMenuItem>POS Tahsilat</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-orange-500 text-white hover:bg-orange-600"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Ödeme
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Nakit Ödeme</DropdownMenuItem>
              <DropdownMenuItem>Havale/EFT Ödeme</DropdownMenuItem>
              <DropdownMenuItem>Şirket Kredi Kartı Ödeme</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-cyan-500 text-white hover:bg-cyan-600"
              >
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                Devir
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Alacak Devri</DropdownMenuItem>
              <DropdownMenuItem>Borç Devri</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
};

export default CurrentTransactionsToolbar;
