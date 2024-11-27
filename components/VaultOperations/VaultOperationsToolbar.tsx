"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  List,
  ArrowDownToLine,
  ArrowUpFromLine,
  Repeat,
  Plus,
} from "lucide-react";
import { Vault } from "./types";
import { useCashTransactionDialog } from "./CashTransactionDialog/useCashTransactionDialog";
import { useTransferDialog } from "./TransferDialog/useTransferDialog";
import { useVaultDialog } from "./VaultDialog/useVaultDialog";
import CashTransactionDialog from "./CashTransactionDialog";
import TransferDialog from "./TransferDialog";
import VaultDialog from "./VaultDialog";

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

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          className="bg-[#84CC16] hover:bg-[#65A30D]"
          onClick={() => openVaultDialog()}
        >
          <Plus className="h-4 w-4 mr-2" />
          Kasa Ekle
        </Button>

        <Button
          variant="default"
          size="sm"
          onClick={onShowAllMovements}
          className="bg-[#84CC16] hover:bg-[#65A30D]"
        >
          <List className="h-4 w-4 mr-2" />
          Tüm Hareketler
        </Button>
      </div>

      {selectedVault && (
        <>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              className="bg-green-500 text-white hover:bg-green-600"
              onClick={() => openCashDialog("income")}
            >
              <ArrowDownToLine className="h-4 w-4 mr-2" />
              Gelir
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="bg-red-500 text-white hover:bg-red-600"
              onClick={() => openCashDialog("expense")}
            >
              <ArrowUpFromLine className="h-4 w-4 mr-2" />
              Gider
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="bg-blue-500 text-white hover:bg-blue-600"
              onClick={() => openTransferDialog()}
            >
              <Repeat className="h-4 w-4 mr-2" />
              İç Transfer
            </Button>
          </div>

          <CashTransactionDialog vault={selectedVault} />
          <TransferDialog sourceVault={selectedVault} />
        </>
      )}
      <VaultDialog />
    </div>
  );
};

export default VaultOperationsToolbar;
