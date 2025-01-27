"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { List, RefreshCw } from "lucide-react";
import { Bank } from "./types";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BankOperationsToolbarProps {
  onShowAllMovements: () => void;
  selectedBank: Bank | null;
  onBankSelect: (bank: Bank | null) => void;
}

const BankOperationsToolbar: React.FC<BankOperationsToolbarProps> = ({
  onShowAllMovements,
  selectedBank,
  onBankSelect,
}) => {
  const { toast } = useToast();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${process.env.BASE_URL}/banks`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Bankalar yüklenemedi");
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          setBanks(data);
        } else {
          console.error("Beklenmeyen veri formatı:", data);
          setBanks([]);
        }
      } catch (error) {
        console.error("Bankalar yüklenirken hata oluştu:", error);
        setBanks([]);
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Bankalar yüklenirken bir hata oluştu.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchBanks();
  }, [toast]);

  const handleRefresh = () => {
    window.dispatchEvent(new CustomEvent("refreshBankOperations"));
    toast({
      title: "Success",
      description: "Veriler başarıyla yenilendi",
    });
  };

  const handleBankChange = (value: string) => {
    const selectedBank = banks.find((bank) => bank.id === value) || null;
    onBankSelect(selectedBank);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center h-10">
        <div className="flex items-center space-x-2">
          <Select
            disabled={isLoading}
            value={selectedBank?.id || ""}
            onValueChange={handleBankChange}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue
                placeholder={isLoading ? "Yükleniyor..." : "Banka Seçin"}
              />
            </SelectTrigger>
            <SelectContent>
              {banks.map((bank) => (
                <SelectItem key={bank.id} value={bank.id}>
                  {bank.bankName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
      </div>
    </div>
  );
};

export default BankOperationsToolbar;
