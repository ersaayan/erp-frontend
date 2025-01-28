"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  FileDown,
  FileUp,
  Wallet,
  CreditCard,
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
import { useCashCollectionDialog } from "./CashCollectionDialog/useCashCollectionDialog";
import { useCashPaymentDialog } from "./CashPaymentDialog/useCashPaymentDialog";
import { useBankTransferDialog } from "./BankTransferDialog/useBankTransferDialog";
import { useBankPaymentDialog } from "./BankPaymentDialog/useBankPaymentDialog";
import { usePosCollectionDialog } from "./PosCollectionDialog/usePosCollectionDialog";
import { usePosPaymentDialog } from "./PosPaymentDialog/usePosPaymentDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Command, CommandInput } from "@/components/ui/command";

interface CurrentTransactionsToolbarProps {
  selectedCurrent: Current | null;
  onCurrentSelect: (current: Current) => void;
  onMenuItemClick: (itemName: string) => void;
}

const CurrentTransactionsToolbar: React.FC<CurrentTransactionsToolbarProps> = ({
  selectedCurrent,
  onCurrentSelect,
  onMenuItemClick,
}) => {
  const { toast } = useToast();
  const { openDialog: openCashCollectionDialog } = useCashCollectionDialog();
  const { openDialog: openCashPaymentDialog } = useCashPaymentDialog();
  const { openDialog: openBankTransferDialog } = useBankTransferDialog();
  const { openDialog: openBankPaymentDialog } = useBankPaymentDialog();
  const { openDialog: openPosCollectionDialog } = usePosCollectionDialog();
  const { openDialog: openPosPaymentDialog } = usePosPaymentDialog();
  const [currents, setCurrents] = useState<Current[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCurrents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.BASE_URL}/currents`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch currents");
      }

      const data = await response.json();
      setCurrents(data);
    } catch (error) {
      console.error("Error fetching currents:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Cariler yüklenirken bir hata oluştu.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCurrents();
  }, [fetchCurrents]);

  const handleRefresh = () => {
    const event = new Event("refreshCurrentMovements");
    window.dispatchEvent(event);
  };

  const handleNewCurrentForm = () => {
    // Navigate to New Current page
    onMenuItemClick?.("Cari Formu");
  };

  const handlePurchaseInvoice = () => {
    if (selectedCurrent) {
      // Store the current data in localStorage
      localStorage.setItem(
        "currentPurchaseInvoice",
        JSON.stringify(selectedCurrent)
      );
      // Navigate to Purchase Invoice page
      onMenuItemClick?.("Alış Faturası");
    }
  };

  const handleSalesInvoice = () => {
    if (selectedCurrent) {
      // Store the current data in localStorage
      localStorage.setItem(
        "currentSalesInvoice",
        JSON.stringify(selectedCurrent)
      );
      // Navigate to Sales Invoice page
      onMenuItemClick?.("Satış Faturası");
    }
  };

  const filteredCurrents =
    currents.filter((current) =>
      current?.currentName
        ?.toLowerCase()
        .includes(searchTerm?.toLowerCase() || "")
    ) || [];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-[#84CC16] hover:bg-[#65A30D]"
            onClick={handleNewCurrentForm}
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
              <DropdownMenuItem onClick={handlePurchaseInvoice}>
                Alış Faturası
              </DropdownMenuItem>
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
              <DropdownMenuItem onClick={handleSalesInvoice}>
                Satış Faturası
              </DropdownMenuItem>
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
              <DropdownMenuItem onClick={() => openCashCollectionDialog()}>
                Nakit Tahsilat
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openBankTransferDialog()}>
                Havale/EFT Tahsilat
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openPosCollectionDialog()}>
                POS Tahsilat
              </DropdownMenuItem>
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
              <DropdownMenuItem onClick={() => openCashPaymentDialog()}>
                Nakit Ödeme
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openBankPaymentDialog()}>
                Havale/EFT Ödeme
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openPosPaymentDialog()}>
                POS Ödeme
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* <DropdownMenu>
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
          </DropdownMenu> */}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Command className="w-[200px]">
            <CommandInput
              placeholder="Cari Ara..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
          </Command>
          <Select
            value={selectedCurrent?.id || ""}
            onValueChange={(value) => {
              const selected = currents.find((c) => c.id === value);
              if (selected) {
                onCurrentSelect(selected);
              }
            }}
          >
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Cari Seçiniz..." />
            </SelectTrigger>
            <SelectContent>
              {filteredCurrents.map((current) => (
                <SelectItem key={current.id} value={current.id}>
                  {current.currentName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CurrentTransactionsToolbar;
