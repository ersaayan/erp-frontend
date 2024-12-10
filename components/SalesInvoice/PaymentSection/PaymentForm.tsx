"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { PaymentAccount } from "./types";

interface PaymentFormProps {
  method: string;
  onSubmit: (data: {
    amount: number;
    accountId: string;
    currency: string;
    description?: string;
  }) => void;
  remainingAmount: number;
  currency: string;
  currencySymbol: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  method,
  onSubmit,
  remainingAmount,
  currency,
  currencySymbol,
}) => {
  const [amount, setAmount] = useState<string>("");
  const [accountId, setAccountId] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        let endpoint = "";
        switch (method) {
          case "cash":
            endpoint = "vaults";
            break;
          case "card":
            endpoint = "pos";
            break;
          case "bank":
            endpoint = "banks";
            break;
          default:
            return;
        }

        const response = await fetch(`${process.env.BASE_URL}/${endpoint}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch accounts");
        }

        const data = await response.json();

        // Transform the data based on the method type
        const transformedAccounts = data.map((item: any) => ({
          id: item.id,
          name:
            method === "cash"
              ? `${item.vaultName} (${item.currency})`
              : method === "card"
              ? `${item.posName} (${item.currency})`
              : `${item.bankName} (${item.currency})`,
          type:
            method === "cash" ? "vault" : method === "card" ? "pos" : "bank",
          currency: item.currency,
        }));

        setAccounts(transformedAccounts);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch accounts"
        );
      } finally {
        setLoading(false);
      }
    };

    if (method !== "openAccount") {
      fetchAccounts();
    }
  }, [method]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || (method !== "openAccount" && !accountId)) return;

    const selectedAccount = accounts.find((acc) => acc.id === accountId);
    onSubmit({
      amount: parseFloat(amount),
      accountId,
      currency: selectedAccount?.currency || currency,
      description,
    });

    // Reset form
    setAmount("");
    setDescription("");
  };

  const handleFullAmount = () => {
    setAmount(remainingAmount.toFixed(2));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading accounts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Tutar</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`${remainingAmount.toFixed(2)}`}
              className="pr-8"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {currencySymbol}
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleFullAmount}
            className="whitespace-nowrap"
          >
            Tam Tutar
          </Button>
        </div>
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
              <SelectValue placeholder="Hesap seçin" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label>Açıklama</Label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Açıklama giriniz"
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-[#84CC16] hover:bg-[#65A30D]"
        disabled={!amount || (method !== "openAccount" && !accountId)}
      >
        Ödeme Ekle
      </Button>
    </form>
  );
};

export default PaymentForm;
