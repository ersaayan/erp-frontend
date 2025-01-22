"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { ExpenseItem } from "../types";
import { currencyService } from "@/lib/services/currency";
import PaymentMethodSelect from "./PaymentMethodSelect";
import PaymentForm from "./PaymentForm";
import PaymentList from "./PaymentList";
import { PaymentDetails } from "./types";
import { StockItem } from "../types";
import { getCurrencySymbol } from "@/lib/utils/currency";

interface PaymentSectionProps {
  products: StockItem[];
  expenses: ExpenseItem[];
  payments: PaymentDetails[];
  onPaymentsChange: (payments: PaymentDetails[]) => void;
  onSave: () => void;
  onDelete?: () => void;
  loading: boolean;
  isEditMode: boolean;
  current: any; // Cari bilgisi
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
  products,
  expenses,
  payments,
  onPaymentsChange,
  onSave,
  onDelete,
  loading,
  isEditMode,
  current,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [exchangeRates, setExchangeRates] = useState({
    USD_TRY: 0,
    EUR_TRY: 0,
  });

  // Fetch exchange rates and set default currency based on current
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const rates = await currencyService.getExchangeRates();
        setExchangeRates(rates);

        // Cari seçildiğinde varsayılan para birimini ayarla
        if (current?.priceList?.currency) {
          setSelectedMethod(current.priceList.currency);
        }
      } catch (error) {
        console.error("Error fetching exchange rates:", error);
      }
    };
    fetchRates();
  }, [current]);

  // Get currency from first product (all products should have same currency)
  const currency =
    current?.priceList?.currency || products[0]?.currency || "TRY";
  const currencySymbol = getCurrencySymbol(currency);

  // Calculate totals
  const totals = useMemo(() => {
    const subtotal = products.reduce(
      (sum, product) => sum + product.quantity * product.unitPrice,
      0
    );

    // Masrafları carinin para birimine dönüştürerek toplama
    const totalExpenses = expenses.reduce((sum, expense) => {
      // Eğer masraf para birimi cari para birimi ile aynı ise direkt ekle
      if (expense.currency === currency) {
        return sum + expense.price;
      }

      // Farklı para birimlerini dönüştür
      let convertedAmount = expense.price;

      // TRY'den diğer para birimlerine dönüşüm
      if (expense.currency === "TRY") {
        if (currency === "USD") {
          convertedAmount = expense.price / exchangeRates.USD_TRY;
        } else if (currency === "EUR") {
          convertedAmount = expense.price / exchangeRates.EUR_TRY;
        }
      }
      // USD'den diğer para birimlerine dönüşüm
      else if (expense.currency === "USD") {
        if (currency === "TRY") {
          convertedAmount = expense.price * exchangeRates.USD_TRY;
        } else if (currency === "EUR") {
          convertedAmount =
            (expense.price * exchangeRates.USD_TRY) / exchangeRates.EUR_TRY;
        }
      }
      // EUR'dan diğer para birimlerine dönüşüm
      else if (expense.currency === "EUR") {
        if (currency === "TRY") {
          convertedAmount = expense.price * exchangeRates.EUR_TRY;
        } else if (currency === "USD") {
          convertedAmount =
            (expense.price * exchangeRates.EUR_TRY) / exchangeRates.USD_TRY;
        }
      }

      return sum + convertedAmount;
    }, 0);

    const vatTotal = products.reduce(
      (sum, product) => sum + product.vatAmount,
      0
    );
    const total = subtotal + vatTotal + totalExpenses;
    const paid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const remaining = Number((total - paid).toFixed(2));
    const hasRemainingAmount = Math.abs(remaining) > 0.01;

    return {
      subtotal,
      totalExpenses,
      vatTotal,
      total,
      paid,
      remaining,
      hasRemainingAmount,
    };
  }, [products, payments, expenses, currency, exchangeRates]);

  // Determine button state and message
  const buttonDisabled = loading || totals.hasRemainingAmount;
  const getButtonTooltip = () => {
    if (totals.hasRemainingAmount) {
      return totals.remaining > 0
        ? `${totals.remaining.toFixed(2)} ${currency} tutarında eksik ödeme var`
        : `${Math.abs(totals.remaining).toFixed(
            2
          )} ${currency} tutarında fazla ödeme var`;
    }
    return "";
  };
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

    onPaymentsChange([...payments, newPayment]);
    setSelectedMethod(null);
  };

  const handlePaymentDelete = (id: string) => {
    onPaymentsChange(payments.filter((payment) => payment.id !== id));
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
            <span>Toplam Masraf</span>
            <span>
              {totals.totalExpenses.toFixed(2)} {currency}
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
            <span
              className={totals.hasRemainingAmount ? "text-destructive" : ""}
            >
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
        disabled={buttonDisabled}
        title={getButtonTooltip()}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEditMode ? "Faturayı Güncelle" : "Faturayı Kaydet"}
      </Button>

      {isEditMode && onDelete && (
        <Button
          className="w-full mt-2 bg-red-500 hover:bg-red-600 text-white"
          size="lg"
          onClick={onDelete}
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Faturayı Sil
        </Button>
      )}
    </div>
  );
};

export default PaymentSection;
