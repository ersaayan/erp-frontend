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
import { Bank } from "./types";
import { useCashTransactionDialog } from "./CashTransactionDialog/useCashTransactionDialog";
import { useTransferDialog } from "./TransferDialog/useTransferDialog";
import { useBankDialog } from "./BankDialog/useBankDialog";
import CashTransactionDialog from "./CashTransactionDialog";
import TransferDialog from "./TransferDialog";
import BankDialog from "./BankDialog";
import { useToast } from "@/hooks/use-toast";

interface BankOperationsToolbarProps {
  onShowAllMovements: () => void;
  selectedBank: Bank | null;
}

const BankOperationsToolbar: React.FC<BankOperationsToolbarProps> = ({
  onShowAllMovements,
  selectedBank,
}) => {
  const { openDialog: openCashDialog } = useCashTransactionDialog();
  const { openDialog: openTransferDialog } = useTransferDialog();
  const { openDialog: openBankDialog } = useBankDialog();
  const { toast } = useToast();

  const handleRefresh = () => {
    window.dispatchEvent(new CustomEvent("refreshBankOperations"));

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
            onClick={() => openBankDialog()}
          >
            <Plus className="h-4 w-4 mr-2" />
            Banka Ekle
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
          {selectedBank && (
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

      <CashTransactionDialog bank={selectedBank} />
      <TransferDialog sourceBank={selectedBank} />
      <BankDialog />
    </div>
  );
};

export default BankOperationsToolbar;
