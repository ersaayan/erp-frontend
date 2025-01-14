"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import CustomerSection from "./CustomerSection";
import InvoiceForm from "./InvoiceForm";
import ProductsSection from "./ProductsSection";
import ExpenseSection from "./ExpenseSection";
import PaymentSection from "./PaymentSection";
import { ExpenseItem, InvoiceFormData, StockItem } from "./types";
import { PaymentDetails } from "./PaymentSection/types";
import { usePurchaseInvoice } from "@/hooks/usePurchaseInvoice";
import { InvoiceDetailResponse } from "@/types/invoice-detail";
import { Badge } from "@/components/ui/badge";

const PurchaseInvoice: React.FC = () => {
  const [invoiceData, setInvoiceData] = useState<InvoiceFormData>({
    id: "",
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
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [payments, setPayments] = useState<PaymentDetails[]>([]);
  const { loading, handleSubmit, handleDelete } = usePurchaseInvoice();
  const [isEditMode, setIsEditMode] = useState(false);

  // Load customer data from localStorage if available (from Current Operations)
  useEffect(() => {
    const savedCurrentData = localStorage.getItem("currentPurchaseInvoice");
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
      localStorage.removeItem("currentPurchaseInvoice");
    }
  }, []);

  // Load invoice data from localStorage if available
  useEffect(() => {
    const savedInvoiceData = localStorage.getItem("currentInvoiceData");
    if (savedInvoiceData) {
      try {
        const invoiceDetail: InvoiceDetailResponse =
          JSON.parse(savedInvoiceData);

        // Set form data
        setInvoiceData({
          id: invoiceDetail.id,
          invoiceNo: invoiceDetail.invoiceNo,
          gibInvoiceNo: invoiceDetail.gibInvoiceNo,
          invoiceDate: new Date(invoiceDetail.invoiceDate),
          paymentDate: new Date(invoiceDetail.paymentDate),
          paymentTerm: invoiceDetail.paymentTerm,
          branchCode: invoiceDetail.branchCode,
          warehouseId: invoiceDetail.warehouseId,
          description: invoiceDetail.description,
          current: {
            id: invoiceDetail.current.id,
            currentCode: invoiceDetail.current.currentCode,
            currentName: invoiceDetail.current.currentName,
            priceList: invoiceDetail.current.priceList,
          },
        });

        // Set products
        setProducts(
          invoiceDetail.items.map((item) => ({
            id: item.id,
            stockId: item.stockId,
            stockCode: item.stockCode,
            stockName: item.stockName,
            quantity: item.quantity,
            unit: item.unit,
            stockLevel: 0,
            unitPrice: item.unitPrice,
            vatRate: item.vatRate,
            vatAmount: item.vatAmount,
            totalAmount: item.totalAmount,
            priceListId: item.priceListId,
            currency: item.currency,
            isVatIncluded: item.isVatIncluded,
          }))
        );

        // Set expenses if they exist
        if (invoiceDetail.expenses) {
          setExpenses(
            invoiceDetail.expenses.map((expense) => ({
              id: expense.id,
              expenseCode: expense.costCode,
              expenseName: expense.costName,
              price: parseFloat(expense.price),
              currency: expense.currency,
            }))
          );
        }

        // Set payments
        if (invoiceDetail.payments && invoiceDetail.payments.length > 0) {
          setPayments(
            invoiceDetail.payments.map((payment) => ({
              id: crypto.randomUUID(),
              method: payment.method,
              amount: payment.amount,
              accountId: payment.accountId,
              currency: payment.currency,
              description: payment.description,
            }))
          );
        } else {
          const totalAmount = invoiceDetail.items.reduce(
            (sum: number, item: any) => sum + (item.totalAmount || 0),
            0
          );

          setPayments([
            {
              id: crypto.randomUUID(),
              method: "openAccount",
              amount: totalAmount,
              accountId: "open-account",
              currency: "TRY",
              description: `${invoiceDetail.invoiceNo} no'lu belge için açık hesap`,
            },
          ]);
        }

        setIsEditMode(true);
        localStorage.removeItem("currentInvoiceData");
      } catch (error) {
        console.error("Error parsing invoice data:", error);
      }
    }
  }, []);

  const handleSave = async () => {
    const result = await handleSubmit(
      invoiceData,
      products,
      expenses,
      payments,
      isEditMode
    );
    if (result.success) {
      // Handle successful save
      console.log("Invoice saved successfully");
    }
  };

  const handleInvoiceDelete = async () => {
    if (invoiceData.id) {
      // Prepare invoice payload
      const invoicePayload = {
        invoiceNo: invoiceData.invoiceNo,
        gibInvoiceNo: invoiceData.gibInvoiceNo,
        invoiceDate: invoiceData.invoiceDate.toISOString(),
        paymentDate: invoiceData.paymentDate.toISOString(),
        paymentDay: invoiceData.paymentTerm,
        branchCode: invoiceData.branchCode,
        warehouseId: invoiceData.warehouseId,
        description: invoiceData.description,
        currentCode: invoiceData.current?.currentCode,
        priceListId: invoiceData.current?.priceList?.id,
        expenses: expenses.map((expense) => ({
          costCode: expense.expenseCode,
          costName: expense.expenseName,
          quantity: 1,
          price: expense.price.toString(),
        })),
        items: products.map((product) => ({
          stockCardId: product.stockId,
          quantity: product.quantity,
          unitPrice: product.unitPrice,
          vatRate: product.vatRate,
          vatAmount: product.vatAmount,
          totalAmount: product.totalAmount,
          priceListId: product.priceListId,
          currency: product.currency,
        })),
        payments: payments.map((payment) => ({
          method: payment.method,
          accountId: payment.accountId,
          amount: payment.amount,
          currency: payment.currency,
          description: payment.description,
        })),
      };

      const result = await handleDelete(invoiceData.id, invoicePayload);
      if (result.success) {
        // Reset form data
        setInvoiceData({
          id: "",
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

        // Reset all states
        setProducts([]);
        setExpenses([]);
        setPayments([]);

        // Reset edit mode
        setIsEditMode(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4">
      <div className="flex items-center space-x-2">
        <h2 className="text-2xl font-bold">
          {isEditMode ? "Fatura Düzenle" : "Alış Faturası"}
        </h2>
        {isEditMode && (
          <Badge variant="secondary" className="ml-2">
            Düzenleme Modu
          </Badge>
        )}
      </div>

      <div className="flex flex-1 gap-4 min-h-0">
        <div className="flex flex-col flex-1 gap-4 overflow-hidden">
          <Card className="p-4">
            <CustomerSection
              customer={invoiceData.current}
              onCustomerChange={(customer) =>
                setInvoiceData((prev) => ({ ...prev, current: customer }))
              }
              isEditMode={isEditMode}
            />
          </Card>

          <Card className="p-4">
            <InvoiceForm
              data={invoiceData}
              onChange={(data) => setInvoiceData(data)}
              isEditMode={isEditMode}
            />
          </Card>

          <Card className="flex-1 p-4 overflow-hidden flex flex-col min-h-0">
            <ProductsSection
              products={products}
              onProductsChange={setProducts}
              current={invoiceData.current}
              warehouseId={invoiceData.warehouseId}
            />
          </Card>

          <Card className="flex-1 p-4 mt-4">
            <ExpenseSection
              expenses={expenses}
              onExpensesChange={setExpenses}
              current={invoiceData.current}
            />
          </Card>
        </div>

        <Card className="w-[400px] p-4 flex flex-col min-h-0">
          <PaymentSection
            products={products}
            expenses={expenses}
            payments={payments}
            onPaymentsChange={setPayments}
            onSave={handleSave}
            onDelete={isEditMode ? handleInvoiceDelete : undefined}
            loading={loading}
            isEditMode={isEditMode}
          />
        </Card>
      </div>
    </div>
  );
};

export default PurchaseInvoice;
