"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import PurchaseInvoiceHeader from "./PurchaseInvoiceHeader";
import PurchaseInvoiceForm from "./PurchaseInvoiceForm";
import CustomerSection from "./CustomerSection";
import PaymentSection from "./PaymentSection";
import { Current } from "../CurrentList/types";
import { usePurchaseInvoiceForm } from "./hooks/usePurchaseInvoiceForm";
import { useToast } from "@/hooks/use-toast";

interface PurchaseInvoiceProps {
  current: Current | null;
}

const PurchaseInvoice: React.FC<PurchaseInvoiceProps> = ({
  current: initialCurrent,
}) => {
  const [current, setCurrent] = useState<Current | null>(initialCurrent);
  const [totalAmount, setTotalAmount] = useState(0);
  const { vaults, banks, posDevices } = usePurchaseInvoiceForm();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCustomerChange = (newCurrent: Current | null) => {
    setCurrent(newCurrent);
    if (!newCurrent) {
      toast({
        title: "Cari Temizlendi",
        description: "Yeni bir cari seçebilirsiniz.",
      });
    }
  };

  const handleTotalAmountChange = (newTotal: number) => {
    setTotalAmount(newTotal);
  };

  const handlePaymentSubmit = async (payments: any[]) => {
    setLoading(true);
    try {
      // Handle payment submission logic here
      console.log("Payments:", payments);
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Ödeme işlemi sırasında bir hata oluştu.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Get currency from customer's price list
  const currency = current?.priceList?.currency || "TRY";

  return (
    <div className="grid-container">
      <PurchaseInvoiceHeader current={current} />
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="col-span-2">
          <Card className="p-6">
            <CustomerSection
              customer={current}
              onCustomerSelect={handleCustomerChange}
              autoOpenSearch={!initialCurrent}
            />
            {current && (
              <PurchaseInvoiceForm
                current={current}
                onTotalAmountChange={handleTotalAmountChange}
              />
            )}
          </Card>
        </div>
        <div className="col-span-1">
          <Card className="p-6">
            <PaymentSection
              total={totalAmount}
              currency={currency}
              vaults={vaults}
              banks={banks}
              posDevices={posDevices}
              onPaymentSubmit={handlePaymentSubmit}
              loading={loading}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PurchaseInvoice;
