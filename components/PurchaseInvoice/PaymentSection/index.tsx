"use client";

import React, { useState, useEffect } from "react";
import { StockItem } from "../types";
import { Current } from "@/components/CurrentList/types";
import { PaymentDetails, PaymentSummary } from "./types";
import PaymentMethodSelector from "./PaymentMethodSelector";
import PaymentList from "./PaymentList";
import { formatCurrency } from "@/lib/utils";

interface PaymentSectionProps {
  products: StockItem[];
  current: Current | null;
  payments: PaymentDetails[];
  onPaymentsChange: (payments: PaymentDetails[]) => void;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
  products,
  current,
  payments,
  onPaymentsChange,
}) => {
  const [summary, setSummary] = useState<PaymentSummary>({
    totalAmount: 0,
    paidAmount: 0,
    remainingAmount: 0,
    currency: current?.priceList?.currency || "TRY",
  });

  useEffect(() => {
    const total = products.reduce(
      (sum, product) => sum + product.totalAmount,
      0
    );
    const paid = payments.reduce((sum, payment) => sum + payment.amount, 0);

    setSummary({
      totalAmount: total,
      paidAmount: paid,
      remainingAmount: total - paid,
      currency: current?.priceList?.currency || "TRY",
    });
  }, [products, payments, current]);

  const handleAddPayment = (payment: PaymentDetails) => {
    onPaymentsChange([...payments, payment]);
  };

  const handleRemovePayment = (paymentId: string) => {
    onPaymentsChange(payments.filter((p) => p.id !== paymentId));
  };

  const currencySymbol = getCurrencySymbol(currency);

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Ödeme Özeti</h3>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Toplam Tutar:</span>
            <span className="font-medium">
              {formatCurrency(summary.totalAmount, summary.currency)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Ödenen Tutar:</span>
            <span className="font-medium text-green-600">
              {formatCurrency(summary.paidAmount, summary.currency)}
            </span>
          </div>
          <div className="flex justify-between text-sm border-t pt-1 mt-1">
            <span className="text-muted-foreground">Kalan Tutar:</span>
            <span className="font-medium text-red-600">
              {formatCurrency(summary.remainingAmount, summary.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Method Selector */}
      <div className="space-y-4">
        <h4 className="font-medium">Yeni Ödeme Ekle</h4>
        <PaymentMethodSelector
          onAddPayment={handleAddPayment}
          remainingAmount={summary.remainingAmount}
          currency={summary.currency}
        />
      </div>

      {/* Payment List */}
      <PaymentList payments={payments} onRemovePayment={handleRemovePayment} />
    </div>
  );
};

export default PaymentSection;
