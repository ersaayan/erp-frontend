"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import CustomerSection from "./CustomerSection";
import InvoiceForm from "./InvoiceForm";
import ProductsSection from "./ProductsSection";
import PaymentSection from "./PaymentSection";
import { InvoiceFormData, StockItem } from "./types";
import { PaymentDetails } from "./PaymentSection/types";
import { useSalesInvoice } from "@/hooks/useSalesInvoice";

const SalesInvoice: React.FC = () => {
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
  const { loading, handleSubmit } = useSalesInvoice();

  // Load customer data from localStorage if available (from Current Operations)
  useEffect(() => {
    const savedCurrentData = localStorage.getItem("currentSalesInvoice");
    if (savedCurrentData) {
      const currentData = JSON.parse(savedCurrentData);
      setInvoiceData((prev) => ({
        ...prev,
        current: {
          id: currentData.id,
          currentCode: currentData.currentCode,
          currentName: currentData.currentName,
          priceList: currentData.priceList,
        },
      }));
      localStorage.removeItem("currentSalesInvoice");
    }
  }, []);

  const handleSave = async () => {
    const result = await handleSubmit(invoiceData, products, payments);
    if (result.success) {
      // Handle successful save
      console.log("Invoice saved successfully");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4 gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Alış Faturası</h1>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        <div className="flex flex-col flex-1 gap-4 overflow-auto">
          <Card className="p-4">
            <CustomerSection
              customer={invoiceData.current}
              onCustomerChange={(customer) =>
                setInvoiceData((prev) => ({ ...prev, current: customer }))
              }
            />
          </Card>

          <Card className="p-4">
            <InvoiceForm
              data={invoiceData}
              onChange={(data) => setInvoiceData(data)}
            />
          </Card>

          <Card className="p-4">
            <ProductsSection
              products={products}
              onProductsChange={setProducts}
              current={invoiceData.current}
              warehouseId={invoiceData.warehouseId}
            />
          </Card>
        </div>

        <Card className="w-[400px] p-4 ">
          <PaymentSection
            products={products}
            payments={payments}
            onPaymentsChange={setPayments}
            onSave={handleSave}
            loading={loading}
          />
        </Card>
      </div>
    </div>
  );
};

export default SalesInvoice;
