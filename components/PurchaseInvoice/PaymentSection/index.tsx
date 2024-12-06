"use client";

import React, { useState } from "react";
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
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { usePayments } from "./usePayments";
import PaymentMethodSelector from "./PaymentMethodSelector";
import PaymentList from "./PaymentList";
import { PaymentDetails } from "./types";
import { getCurrencySymbol } from "@/lib/utils/currency";

interface PaymentSectionProps {
  total: number;
  currency: string;
  vaults?: Array<{ id: string; vaultName: string }>;
  banks?: Array<{ id: string; bankName: string }>;
  posDevices?: Array<{ id: string; posName: string }>;
  onPaymentSubmit: (payments: PaymentDetails[]) => Promise<void>;
  loading: boolean;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
  total,
  currency,
  vaults = [],
  banks = [],
  posDevices = [],
  onPaymentSubmit,
  loading,
}) => {
  const {
    payments,
    addPayment,
    updatePayment,
    removePayment,
    getRemainingAmount,
  } = usePayments(total);
  const [selectedMethod, setSelectedMethod] = useState<
    PaymentDetails["type"] | null
  >(null);
  const [amount, setAmount] = useState<string>("");
  const [accountId, setAccountId] = useState<string>("");
  const [editingPayment, setEditingPayment] = useState<PaymentDetails | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<PaymentDetails | null>(
    null
  );

  const remainingAmount = getRemainingAmount();

  const handleAddPayment = () => {
    if (!amount || parseFloat(amount) <= 0 || !selectedMethod) return;

    const accountName = getAccountName(accountId);
    const accountDetails = getAccountDetails(selectedMethod, accountId);

    if (editingPayment) {
      updatePayment(editingPayment.id, {
        type: selectedMethod,
        amount: parseFloat(amount),
        accountId,
        accountName,
        accountDetails,
      });
      setEditingPayment(null);
    } else {
      addPayment(
        {
          id: crypto.randomUUID(),
          type: selectedMethod,
          amount: parseFloat(amount),
          accountId,
        },
        accountName,
        accountDetails
      );
    }

    setAmount("");
    setAccountId("");
    setSelectedMethod(null);
  };

  const handleEditPayment = (payment: PaymentDetails) => {
    setEditingPayment(payment);
    setSelectedMethod(payment.type);
    setAmount(payment.amount.toString());
    setAccountId(payment.accountId || "");
  };

  const handleDeletePayment = (payment: PaymentDetails) => {
    setPaymentToDelete(payment);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (paymentToDelete) {
      removePayment(paymentToDelete.id);
    }
    setDeleteDialogOpen(false);
    setPaymentToDelete(null);
  };

  const handleSubmit = async () => {
    await onPaymentSubmit(payments);
  };

  const getAccountOptions = () => {
    switch (selectedMethod) {
      case "cash":
        return vaults || [];
      case "transfer":
        return banks || [];
      case "card":
        return posDevices || [];
      default:
        return [];
    }
  };

  const getAccountLabel = () => {
    switch (selectedMethod) {
      case "cash":
        return "Kasa";
      case "transfer":
        return "Banka Hesabı";
      case "card":
        return "POS";
      default:
        return "Hesap";
    }
  };

  const getAccountName = (id: string) => {
    const options = getAccountOptions();
    const account = options.find((opt) => opt.id === id);
    return account
      ? "vaultName" in account
        ? account.vaultName
        : "bankName" in account
        ? account.bankName
        : "posName" in account
        ? account.posName
        : ""
      : "";
  };

  const getAccountDetails = (
    type: PaymentDetails["type"],
    accountId: string
  ): string => {
    const accountName = getAccountName(accountId);
    switch (type) {
      case "cash":
        return `${accountName} - Nakit`;
      case "transfer":
        const bank = banks.find((b) => b.id === accountId);
        return bank ? `${bank.bankName}` : accountName;
      case "card":
        const pos = posDevices.find((p) => p.id === accountId);
        return pos ? `${pos.posName}` : accountName;
      default:
        return "";
    }
  };

  const isPaymentMethodSelected = selectedMethod !== null;
  const isAmountValid = amount !== "" && parseFloat(amount) > 0;
  const isAccountSelected = accountId !== "";
  const canAddPayment =
    isPaymentMethodSelected &&
    isAmountValid &&
    (selectedMethod === "credit" || isAccountSelected);

  const currencySymbol = getCurrencySymbol(currency);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <span>Toplam Tutar</span>
          <span>
            {formatCurrency(total)} {currencySymbol}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Kalan Tutar</span>
          <span
            className={remainingAmount > 0 ? "text-red-500" : "text-green-500"}
          >
            {formatCurrency(remainingAmount)} {currencySymbol}
          </span>
        </div>
      </div>

      <PaymentMethodSelector
        selectedMethod={selectedMethod}
        onMethodSelect={setSelectedMethod}
      />

      <div className="space-y-4">
        <div>
          <Label>Tutar</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </div>

        {selectedMethod !== "credit" && (
          <div>
            <Label>{getAccountLabel()}</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger>
                <SelectValue placeholder={`${getAccountLabel()} seçin`} />
              </SelectTrigger>
              <SelectContent>
                {getAccountOptions().map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {getAccountName(account.id)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Button
          className="w-full"
          onClick={handleAddPayment}
          disabled={!canAddPayment}
        >
          {editingPayment ? "Ödemeyi Güncelle" : "Ödeme Ekle"}
        </Button>

        <PaymentList
          payments={payments}
          onEdit={handleEditPayment}
          onDelete={handleDeletePayment}
          currency={currency}
        />

        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={loading || remainingAmount !== 0}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Ödemeleri Tamamla
        </Button>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ödemeyi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu ödemeyi silmek istediğinizden emin misiniz? Bu işlem geri
              alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Sil</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PaymentSection;
