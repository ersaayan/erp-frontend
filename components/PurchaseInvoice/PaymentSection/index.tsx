"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import PaymentMethodSelect from "./PaymentMethodSelect";
import PaymentForm from "./PaymentForm";
import PaymentList from "./PaymentList";
import { PaymentDetails } from "./types";
import { StockItem } from "../types";
import { getCurrencySymbol } from "@/lib/utils/currency";

interface PaymentSectionProps {
  products: StockItem[];
  payments: PaymentDetails[];
  onPaymentsChange: (payments: PaymentDetails[]) => void;
  onSave: () => void;
  loading: boolean;
  isEditMode: boolean;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
  products,
  payments = [],
  onPaymentsChange,
  onSave,
  loading,
  isEditMode,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  // Get currency from first product (all products should have same currency)
  const currency = products[0]?.currency || "TRY";
  const currencySymbol = getCurrencySymbol(currency);

  // Calculate totals
  const totals = useMemo(() => {
    const subtotal = products.reduce(
      (sum, product) => sum + product.quantity * product.unitPrice,
      0
    );
    const vatTotal = products.reduce(
      (sum, product) => sum + product.vatAmount,
      0
    );
    const total = subtotal + vatTotal;
    const paid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const remaining = total - paid;

    return {
      subtotal,
      vatTotal,
      total,
      paid,
      remaining,
    };
  }, [products, payments]);

  const handlePaymentAdd = (data: {
    amount: number;
    accountId: string;
    currency: string;
    description?: string;
  }) => {
    if (!selectedMethod) return;

    const newPayment: PaymentDetails = {
      id: crypto.randomUUID(),
      method: selectedMethod as PaymentDetails["method"],
      ...data,
    };

    onPaymentsChange([...(payments || []), newPayment]);
    setSelectedMethod(null);
  };

  const handlePaymentDelete = (id: string) => {
    onPaymentsChange((payments || []).filter((payment) => payment.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Ödeme</h2>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Ara Toplam</span>
            <span>
              {totals.subtotal.toFixed(2)} {currency}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>KDV</span>
            <span>
              {totals.vatTotal.toFixed(2)} {currency}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between font-medium">
            <span>Genel Toplam</span>
            <span>
              {totals.total.toFixed(2)} {currency}
            </span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Ödenen</span>
            <span>
              {totals.paid.toFixed(2)} {currency}
            </span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Kalan</span>
            <span>
              {totals.remaining.toFixed(2)} {currency}
            </span>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="font-medium">Ödeme Yöntemi</h3>
        <PaymentMethodSelect
          selectedMethod={selectedMethod}
          onMethodSelect={setSelectedMethod}
        />

        {selectedMethod && (
          <PaymentForm
            method={selectedMethod}
            onSubmit={handlePaymentAdd}
            remainingAmount={totals.remaining}
            currency={currency}
            currencySymbol={currencySymbol}
          />
        )}

        {payments.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h3 className="font-medium">Ödemeler</h3>
              <PaymentList payments={payments} onDelete={handlePaymentDelete} />
            </div>
          </>
        )}
      </div>

      <Separator />

      <Button
        className="w-full bg-[#84CC16] hover:bg-[#65A30D]"
        size="lg"
        onClick={onSave}
        disabled={loading || products.length === 0 || totals.remaining !== 0}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEditMode ? "Faturayı Güncelle" : "Faturayı Kaydet"}
      </Button>
    </div>
  );
};

export default PaymentSection;
