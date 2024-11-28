"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  List,
  ArrowDownToLine,
  ArrowUpFromLine,
  Repeat,
  Plus,
  RefreshCw,
} from "lucide-react";
import { Vault } from "./types";
import { useCashTransactionDialog } from "./CashTransactionDialog/useCashTransactionDialog";
import { useTransferDialog } from "./TransferDialog/useTransferDialog";
import { useVaultDialog } from "./VaultDialog/useVaultDialog";
import CashTransactionDialog from "./CashTransactionDialog";
import TransferDialog from "./TransferDialog";
import VaultDialog from "./VaultDialog";
import { useToast } from "@/hooks/use-toast";

interface VaultOperationsToolbarProps {
  onShowAllMovements: () => void;
  selectedVault: Vault | null;
}

const VaultOperationsToolbar: React.FC<VaultOperationsToolbarProps> = ({
  onShowAllMovements,
  selectedVault,
}) => {
  const { openDialog: openCashDialog } = useCashTransactionDialog();
  const { openDialog: openTransferDialog } = useTransferDialog();
  const { openDialog: openVaultDialog } = useVaultDialog();
  const { toast } = useToast();

  const handleRefresh = () => {
    window.dispatchEvent(new CustomEvent("refreshVaultOperations"));

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
            className="bg-[#84CC16] hover:bg-[#65A30D] min-w-[120px]"
            onClick={() => openVaultDialog()}
          >
            <Plus className="h-4 w-4 mr-2" />
            Kasa Ekle
          </Button>

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

        <div className="flex items-center space-x-2">
          {selectedVault && (
            <>
              <Button
                variant="outline"
                size="default"
                className="bg-green-500 text-white hover:bg-green-600 min-w-[120px]"
                onClick={() => openCashDialog("income")}
              >
                <ArrowDownToLine className="h-4 w-4 mr-2" />
                Gelir
              </Button>

              <Button
                variant="outline"
                size="default"
                className="bg-red-500 text-white hover:bg-red-600 min-w-[120px]"
                onClick={() => openCashDialog("expense")}
              >
                <ArrowUpFromLine className="h-4 w-4 mr-2" />
                Gider
              </Button>

              <Button
                variant="outline"
                size="default"
                className="bg-blue-500 text-white hover:bg-blue-600 min-w-[120px]"
                onClick={() => openTransferDialog()}
              >
                <Repeat className="h-4 w-4 mr-2" />
                İç Transfer
              </Button>
            </>
          )}
        </div>
      </div>
      <CashTransactionDialog vault={selectedVault} />
      <TransferDialog sourceVault={selectedVault} />
      <VaultDialog />
    </div>
  );
};

export default VaultOperationsToolbar;
