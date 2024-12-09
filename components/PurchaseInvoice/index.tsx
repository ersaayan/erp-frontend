// PurchaseInvoice/index.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { InvoiceFormData, StockItem } from "./types";
import CurrentSection from "./CurrentSection";
import InvoiceForm from "./InvoiceForm";
import ProductsSection from "./ProductsSection";
import PaymentSection from "./PaymentSection";
import { Current } from "../CurrentList/types";
import { PaymentDetails } from "./PaymentSection/types";
import { usePurchaseInvoice } from "@/hooks/usePurchaseInvoice";
import { useRouter } from "next/navigation";

const PurchaseInvoice: React.FC = () => {
  const router = useRouter();
  const [currentData, setCurrentData] = useState<Current | null>(null);
  const [invoiceData, setInvoiceData] = useState<InvoiceFormData>({
    invoiceNo: "",
    gibInvoiceNo: "",
    invoiceDate: new Date(),
    paymentDate: new Date(),
    paymentTerm: 0,
    branchCode: "",
    warehouseId: "",
    description: "",
    current: null,
  });
  const [products, setProducts] = useState<StockItem[]>([]);
  const [payments, setPayments] = useState<PaymentDetails[]>([]);
  const { loading, handleSubmit } = usePurchaseInvoice();

  useEffect(() => {
    const savedCurrent = localStorage.getItem("currentPurchaseInvoice");
    if (savedCurrent) {
      const parsedCurrent = JSON.parse(savedCurrent);
      setCurrentData(parsedCurrent);
      setInvoiceData((prev) => ({ ...prev, current: parsedCurrent }));
      localStorage.removeItem("currentPurchaseInvoice");
    }
  }, []);

  const handleCurrentChange = (current: Current | null) => {
    setCurrentData(current);
    setInvoiceData((prev) => ({ ...prev, current }));
  };

  const handleSave = async () => {
    const result = await handleSubmit(invoiceData, products, payments);
    if (result.success) {
      router.push("/");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 p-4">
        <h2 className="text-2xl font-bold">Alış Faturası</h2>
        <Button
          onClick={handleSave}
          disabled={loading}
          className="bg-[#84CC16] hover:bg-[#65A30D]"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          Kaydet
        </Button>
      </div>

      <div className="flex-grow p-4 space-y-4">
        {/* Current Section at the top */}
        <CurrentSection
          currentData={currentData}
          onCurrentChange={handleCurrentChange}
        />

        <div className="grid grid-cols-12 gap-4">
          {/* Left Column - Main Content */}
          <div className="col-span-8 space-y-4">
            {/* Invoice Form */}
            <Card className="p-6">
              <InvoiceForm
                invoiceData={invoiceData}
                onInvoiceDataChange={setInvoiceData}
                currentData={currentData}
                onCurrentChange={handleCurrentChange}
              />
            </Card>

            {/* Products Section */}
            <Card className="p-6">
              <ProductsSection
                products={products}
                setProducts={setProducts}
                warehouseId={invoiceData.warehouseId}
                current={currentData}
              />
            </Card>
          </div>

          {/* Right Column - Payment Section */}
          <div className="col-span-4">
            <div className="sticky top-4">
              <Card className="p-6 border-2">
                <PaymentSection
                  products={products}
                  current={currentData}
                  payments={payments}
                  onPaymentsChange={setPayments}
                />
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseInvoice;
