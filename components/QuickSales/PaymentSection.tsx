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
import { CartItem, Payment } from "./types";
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface PaymentSectionProps {
  cart: CartItem[];
  onProcessPayment: (payments: Payment[]) => Promise<void>;
  loading: boolean;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
  cart,
  onProcessPayment,
  loading,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<Payment["method"]>("cash");
  const [reference, setReference] = useState("");

  const subtotal = cart.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const totalDiscount = cart.reduce(
    (sum, item) => sum + item.discountAmount,
    0
  );
  const totalVat = cart.reduce((sum, item) => sum + item.vatAmount, 0);
  const total = cart.reduce((sum, item) => sum + item.totalAmount, 0);

  const handlePayment = async () => {
    const payment: Payment = {
      method: paymentMethod,
      amount: total,
      reference: reference,
    };

    await onProcessPayment([payment]);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <span>Ara Toplam</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Toplam İndirim</span>
          <span className="text-red-500">-{formatCurrency(totalDiscount)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Toplam KDV</span>
          <span>{formatCurrency(totalVat)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg">
          <span>Genel Toplam</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Ödeme Yöntemi</Label>
          <Select
            value={paymentMethod}
            onValueChange={(value) =>
              setPaymentMethod(value as Payment["method"])
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Nakit</SelectItem>
              <SelectItem value="card">Kredi Kartı</SelectItem>
              <SelectItem value="transfer">Havale</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {paymentMethod !== "cash" && (
          <div className="space-y-2">
            <Label>Referans No</Label>
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Referans no giriniz"
            />
          </div>
        )}

        <Button
          className="w-full"
          size="lg"
          onClick={handlePayment}
          disabled={loading || cart.length === 0}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Ödeme Al
        </Button>
      </div>
    </div>
  );
};

export default PaymentSection;
