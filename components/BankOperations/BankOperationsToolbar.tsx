"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { List, ArrowDownToLine, ArrowUpFromLine, Repeat } from "lucide-react";
import { Bank } from "./types";
import { useCashTransactionDialog } from "./CashTransactionDialog/useCashTransactionDialog";
import { useTransferDialog } from "./TransferDialog/useTransferDialog";
import CashTransactionDialog from "./CashTransactionDialog";
import TransferDialog from "./TransferDialog";

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

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end">
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

      {selectedBank && (
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

          <CashTransactionDialog bank={selectedBank} />
          <TransferDialog sourceBank={selectedBank} />
        </>
      )}
    </div>
  );
};

export default BankOperationsToolbar;
