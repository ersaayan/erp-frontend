"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, CreditCard } from "lucide-react";
import PaymentMethodSelect from "./PaymentMethodSelect";
import PaymentForm from "./PaymentForm";
import PaymentList from "./PaymentList";
import { PaymentDetails } from "./types";
import { getCurrencySymbol } from "@/lib/utils/currency";

interface PaymentSectionProps {
  cart: Array<{
    unitPrice: number;
    quantity: number;
    discountAmount: number;
    vatAmount: number;
    totalAmount: number;
    currency: string;
  }>;
  payments: PaymentDetails[];
  onPaymentsChange: (payments: PaymentDetails[]) => void;
  onProcessPayment: (payments: PaymentDetails[]) => Promise<void>;
  onDelete?: () => Promise<void>;
  loading: boolean;
  isEditMode?: boolean;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
  cart,
  payments = [], // Provide default empty array
  onPaymentsChange,
  onProcessPayment,
  onDelete,
  loading,
  isEditMode = false,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  // Get currency from first product (all products should have same currency)
  const currency = cart[0]?.currency || "TRY";
  const currencySymbol = getCurrencySymbol(currency);

  // Calculate totals with null checks and default values
  const totals = useMemo(() => {
    const subtotal =
      cart?.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) ?? 0;

    const totalDiscount =
      cart?.reduce((sum, item) => sum + (item.discountAmount || 0), 0) ?? 0;

    const totalVat =
      cart?.reduce((sum, item) => sum + (item.vatAmount || 0), 0) ?? 0;

    const total =
      cart?.reduce((sum, item) => sum + (item.totalAmount || 0), 0) ?? 0;

    const paid =
      payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) ?? 0;

    const remaining = total - paid;

    return {
      subtotal,
      totalDiscount,
      totalVat,
      total,
      paid,
      remaining,
    };
  }, [cart, payments]);

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

  const handleProcessPayment = () => {
    onProcessPayment(payments || []);
  };

  const canProcessPayment = payments.length > 0 && totals.remaining <= 0;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <span>Ara Toplam</span>
          <span>
            {totals.subtotal.toFixed(2)} {currency}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Toplam İndirim</span>
          <span className="text-red-500">
            -{totals.totalDiscount.toFixed(2)} {currency}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Toplam KDV</span>
          <span>
            {totals.totalVat.toFixed(2)} {currency}
          </span>
        </div>
        <Separator />
        <div className="flex justify-between font-bold text-lg">
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

        {payments && payments.length > 0 && (
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

      <div className="flex flex-col gap-2 mt-4">
        <Button
          className="w-full"
          size="lg"
          onClick={handleProcessPayment}
          disabled={!canProcessPayment || loading}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CreditCard className="mr-2 h-4 w-4" />
          )}
          {isEditMode ? "Siparişi Güncelle" : "Satışı Tamamla"}
        </Button>

        {isEditMode && onDelete && (
          <Button
            variant="destructive"
            className="w-full"
            size="lg"
            onClick={onDelete}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="mr-2 h-4 w-4" />
            )}
            Siparişi Sil
          </Button>
        )}
      </div>
    </div>
  );
};

export default PaymentSection;
