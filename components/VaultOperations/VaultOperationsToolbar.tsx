"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { List, ArrowDownToLine, ArrowUpFromLine, Repeat } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Vault } from "./types";

interface VaultOperationsToolbarProps {
  onShowAllMovements: () => void;
  selectedVault: Vault | null;
}

const VaultOperationsToolbar: React.FC<VaultOperationsToolbarProps> = ({
  onShowAllMovements,
  selectedVault,
}) => {
  const incomeOptions = [
    { id: "debtTransfer", label: "Borç Tahsilatı" },
    { id: "serviceFeeCollection", label: "Hizmet/Masraf Tahsilatı" },
    { id: "creditCardWithdrawal", label: "Şirket Kredi Kartı Çekimi" },
    { id: "loanWithdrawal", label: "Kredi Çekimi" },
    { id: "foreignExchangePurchase", label: "Döviz Alış" },
    { id: "incomeReceipt", label: "Gelir Makbuzu" },
    { id: "bankWithdrawal", label: "Banka Çekimi" },
  ];

  const expenseOptions = [
    { id: "creditTransfer", label: "Alacak Ödemesi" },
    { id: "serviceFeePayment", label: "Hizmet/Masraf Ödemesi" },
    { id: "creditCardDeposit", label: "Şirket Kredi Kartı Yatırma" },
    { id: "foreignExchangeSale", label: "Döviz Satış" },
    { id: "loanPayment", label: "Kredi Ödemesi" },
    { id: "expenseReceipt", label: "Gider Makbuzu" },
    { id: "bankPayment", label: "Banka Yatırma" },
    { id: "valuableAssetSale", label: "Kıymetli Varlık Satışı" },
  ];

  const handleOptionClick = (type: string, optionId: string) => {
    console.log(`${type} option clicked:`, optionId);
    // TODO: Implement action handling
  };

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

      {selectedVault && (
        <div className="flex gap-2 justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-green-500 text-white hover:bg-green-600"
              >
                <ArrowDownToLine className="h-4 w-4 mr-2" />
                Gelir
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {incomeOptions.map((option) => (
                <DropdownMenuItem
                  key={option.id}
                  onClick={() => handleOptionClick("income", option.id)}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-red-500 text-white hover:bg-red-600"
              >
                <ArrowUpFromLine className="h-4 w-4 mr-2" />
                Gider
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {expenseOptions.map((option) => (
                <DropdownMenuItem
                  key={option.id}
                  onClick={() => handleOptionClick("expense", option.id)}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            <Repeat className="h-4 w-4 mr-2" />
            İç Transfer
          </Button>
        </div>
      )}
    </div>
  );
};

export default VaultOperationsToolbar;
