"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaymentDetails, PaymentMethod } from "./types";
import { useToast } from "@/hooks/use-toast";

interface PaymentMethodSelectorProps {
  onAddPayment: (payment: PaymentDetails) => void;
  remainingAmount: number;
  currency: string;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  onAddPayment,
  remainingAmount,
  currency,
}) => {
  const [method, setMethod] = useState<
    "cash" | "card" | "wire" | "openAccount"
  >("cash");
  const [amount, setAmount] = useState<string>("");
  const [accountId, setAccountId] = useState<string>("");
  const [accounts, setAccounts] = useState<PaymentMethod[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        let endpoint = "";
        switch (method) {
          case "cash":
            endpoint = "/vaults";
            break;
          case "card":
            endpoint = "/pos";
            break;
          case "wire":
            endpoint = "/banks";
            break;
          default:
            return;
        }

        const response = await fetch(`${process.env.BASE_URL}${endpoint}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          credentials: "include",
        });

        if (!response.ok) throw new Error("Failed to fetch accounts");

        const data = await response.json();
        setAccounts(
          data.map((item: any) => ({
            id: item.id,
            name:
              item.vaultName || item.posName || item.bankName || "Unknown Name",
            currency: item.currency,
            balance: item.balance,
          }))
        );
      } catch (error) {
        console.error("Error fetching accounts:", error);
        setAccounts([]);
      }
    };

    if (method !== "openAccount") {
      fetchAccounts();
    }
  }, [method]);

  const handleAddPayment = () => {
    if (!amount || (method !== "openAccount" && !accountId)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid amount",
      });
      return;
    }

    if (numericAmount > remainingAmount) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Payment amount cannot exceed remaining amount",
      });
      return;
    }

    const payment: PaymentDetails = {
      id: crypto.randomUUID(),
      method,
      accountId,
      amount: numericAmount,
      currency,
    };

    onAddPayment(payment);
    setAmount("");
    setAccountId("");
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Ödeme Yöntemi</Label>
        <Select value={method} onValueChange={(v) => setMethod(v as any)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">Nakit</SelectItem>
            <SelectItem value="card">Kredi Kartı</SelectItem>
            <SelectItem value="wire">Havale/EFT</SelectItem>
            <SelectItem value="openAccount">Açık Hesap</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {method !== "openAccount" && (
        <div>
          <Label>
            {method === "cash"
              ? "Kasa"
              : method === "card"
              ? "POS"
              : "Banka Hesabı"}
          </Label>
          <Select value={accountId} onValueChange={setAccountId}>
            <SelectTrigger>
              <SelectValue
                placeholder={`${
                  method === "cash"
                    ? "Kasa"
                    : method === "card"
                    ? "POS"
                    : "Banka Hesabı"
                } seçin`}
              />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name} ({account.currency})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label>Tutar</Label>
        <div className="flex space-x-2">
          <Input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={() => setAmount(remainingAmount.toString())}
            variant="outline"
          >
            Kalan Tutar
          </Button>
        </div>
      </div>

      <Button
        onClick={handleAddPayment}
        className="w-full bg-[#84CC16] hover:bg-[#65A30D]"
      >
        Ödeme Ekle
      </Button>
    </div>
  );
};

export default PaymentMethodSelector;
