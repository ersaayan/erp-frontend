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
import { Loader2, Pencil, Trash2 } from "lucide-react";
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

interface PaymentMethod {
  id: string;
  type: "cash" | "card" | "transfer" | "credit";
  amount: number;
  accountId?: string;
}

interface PaymentSectionProps {
  total: number;
  vaults?: Array<{ id: string; vaultName: string }>;
  banks?: Array<{ id: string; bankName: string }>;
  posDevices?: Array<{ id: string; posName: string }>;
  onPaymentSubmit: (payments: PaymentMethod[]) => Promise<void>;
  loading: boolean;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
  total,
  vaults = [],
  banks = [],
  posDevices = [],
  onPaymentSubmit,
  loading,
}) => {
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethod["type"]>("cash");
  const [amount, setAmount] = useState<string>("");
  const [accountId, setAccountId] = useState<string>("");
  const [payments, setPayments] = useState<PaymentMethod[]>([]);
  const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<PaymentMethod | null>(
    null
  );

  const remainingAmount =
    total - payments.reduce((sum, p) => sum + p.amount, 0);

  const handleAddPayment = () => {
    if (!amount || parseFloat(amount) <= 0 || !selectedMethod) return;

    const newPayment: PaymentMethod = {
      id: editingPayment?.id || crypto.randomUUID(),
      type: selectedMethod,
      amount: parseFloat(amount),
      accountId: accountId || undefined,
    };

    if (editingPayment) {
      setPayments(
        payments.map((p) => (p.id === editingPayment.id ? newPayment : p))
      );
      setEditingPayment(null);
    } else {
      setPayments([...payments, newPayment]);
    }

    setAmount("");
    setAccountId("");
  };

  const handleEditPayment = (payment: PaymentMethod) => {
    setEditingPayment(payment);
    setSelectedMethod(payment.type);
    setAmount(payment.amount.toString());
    setAccountId(payment.accountId || "");
  };

  const handleDeletePayment = (payment: PaymentMethod) => {
    setPaymentToDelete(payment);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (paymentToDelete) {
      setPayments(payments.filter((p) => p.id !== paymentToDelete.id));
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

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <span>Toplam Tutar</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Kalan Tutar</span>
          <span
            className={remainingAmount > 0 ? "text-red-500" : "text-green-500"}
          >
            {formatCurrency(remainingAmount)}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant={selectedMethod === "cash" ? "default" : "outline"}
            onClick={() => setSelectedMethod("cash")}
          >
            Nakit
          </Button>
          <Button
            variant={selectedMethod === "card" ? "default" : "outline"}
            onClick={() => setSelectedMethod("card")}
          >
            Kredi Kartı
          </Button>
          <Button
            variant={selectedMethod === "transfer" ? "default" : "outline"}
            onClick={() => setSelectedMethod("transfer")}
          >
            Havale/EFT
          </Button>
          <Button
            variant={selectedMethod === "credit" ? "default" : "outline"}
            onClick={() => setSelectedMethod("credit")}
          >
            Açık Hesap
          </Button>
        </div>

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
        </div>

        <Button
          className="w-full"
          onClick={handleAddPayment}
          disabled={!amount || parseFloat(amount) <= 0}
        >
          {editingPayment ? "Ödemeyi Güncelle" : "Ödeme Ekle"}
        </Button>

        {payments.length > 0 && (
          <div className="space-y-2">
            <Label>Eklenen Ödemeler</Label>
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex justify-between items-center p-2 border rounded"
              >
                <span>{payment.type}</span>
                <span>{formatCurrency(payment.amount)}</span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditPayment(payment)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeletePayment(payment)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

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
