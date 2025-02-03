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
import { useSalesInvoice } from "@/hooks/useSalesInvoice";
import { InvoiceDetailResponse } from "@/types/invoice-detail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer, Maximize2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { printInvoice } from "@/lib/services/print/invoice";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const SalesInvoice: React.FC = () => {
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
  const { loading, handleSubmit, handleDelete } = useSalesInvoice();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);
  const [isExpensesModalOpen, setIsExpensesModalOpen] = useState(false);

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

  // Form verilerini localStorage'a kaydetme
  useEffect(() => {
    if (
      invoiceData.current ||
      products.length > 0 ||
      expenses.length > 0 ||
      payments.length > 0
    ) {
      const formData = {
        invoiceData,
        products,
        expenses,
        payments,
      };
      localStorage.setItem("salesInvoiceFormData", JSON.stringify(formData));
    }
  }, [invoiceData, products, expenses, payments]);

  // Form verilerini localStorage'dan yükleme
  useEffect(() => {
    const savedFormData = localStorage.getItem("salesInvoiceFormData");
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);

        // Tarihleri Date objelerine çevirme
        if (parsedData.invoiceData) {
          parsedData.invoiceData.invoiceDate = new Date(
            parsedData.invoiceData.invoiceDate
          );
          parsedData.invoiceData.paymentDate = new Date(
            parsedData.invoiceData.paymentDate
          );
          setInvoiceData(parsedData.invoiceData);
        }

        if (parsedData.products) {
          setProducts(parsedData.products);
        }

        if (parsedData.expenses) {
          setExpenses(parsedData.expenses);
        }

        if (parsedData.payments) {
          setPayments(parsedData.payments);
        }
      } catch (error) {
        console.error("Form verilerini yüklerken hata oluştu:", error);
      }
    }
  }, []);

  // Form gönderildiğinde veya silindiğinde localStorage'ı temizleme
  const handleFormSubmit = async () => {
    try {
      await handleSubmit(invoiceData, products, expenses, payments);
      localStorage.removeItem("salesInvoiceFormData");
    } catch (error) {
      console.error("Form gönderilirken hata oluştu:", error);
    }
  };

  const handleFormDelete = async () => {
    try {
      await handleDelete();
      localStorage.removeItem("salesInvoiceFormData");
    } catch (error) {
      console.error("Form silinirken hata oluştu:", error);
    }
  };

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
          currency: expense.currency,
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
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4 gap-4">
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-2xl font-bold">
          {isEditMode ? "Fatura Düzenle" : "Satış Faturası"}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              try {
                printInvoice(
                  {
                    ...invoiceData,
                    items: products,
                    expenses,
                    payments,
                  },
                  {
                    title: "Satış Faturası",
                    type: "sales",
                  }
                );
                toast({
                  title: "Başarılı",
                  description: "Yazdırma işlemi başlatıldı",
                });
              } catch (error) {
                toast({
                  variant: "destructive",
                  title: "Hata",
                  description:
                    error instanceof Error
                      ? error.message
                      : "Yazdırma işlemi başarısız oldu",
                });
              }
            }}
            disabled={!invoiceData.current || products.length === 0}
            className="bg-[#84CC16] hover:bg-[#65A30D] text-white"
          >
            <Printer className="h-4 w-4 mr-2" />
            Yazdır
          </Button>
          {isEditMode && (
            <Badge variant="secondary" className="ml-2">
              Düzenleme Modu
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-[1fr_400px] gap-4 flex-1 min-h-0">
        <div className="flex flex-col gap-4 overflow-hidden">
          <div className="grid grid-cols-2 gap-4 shrink-0">
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
          </div>

          <div className="grid grid-rows-2 gap-4 flex-1">
            <Card className="p-4 overflow-hidden flex flex-col h-[calc(25vh)]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Ürünler</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsProductsModalOpen(true)}
                >
                  <Maximize2 className="h-4 w-4 mr-2" />
                  Tam Ekran
                </Button>
              </div>
              <div className="flex-1 overflow-auto">
                <ProductsSection
                  products={products}
                  onProductsChange={setProducts}
                  current={invoiceData.current}
                  warehouseId={invoiceData.warehouseId}
                />
              </div>
            </Card>

            <Card className="p-4 overflow-hidden flex flex-col h-[calc(25vh)]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Masraflar</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExpensesModalOpen(true)}
                >
                  <Maximize2 className="h-4 w-4 mr-2" />
                  Tam Ekran
                </Button>
              </div>
              <div className="flex-1 overflow-auto">
                <ExpenseSection
                  expenses={expenses}
                  onExpensesChange={setExpenses}
                  current={invoiceData.current}
                />
              </div>
            </Card>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Card className="flex-1 p-4">
            <PaymentSection
              products={products}
              expenses={expenses}
              payments={payments}
              onPaymentsChange={setPayments}
              onSave={handleSave}
              onDelete={isEditMode ? handleInvoiceDelete : undefined}
              loading={loading}
              isEditMode={isEditMode}
              current={invoiceData.current}
            />
          </Card>

          <div className="flex justify-end gap-2 shrink-0">
            <Button onClick={handleFormSubmit}>Kaydet</Button>
            <Button onClick={handleFormDelete}>Sil</Button>
          </div>
        </div>
      </div>

      <Dialog open={isProductsModalOpen} onOpenChange={setIsProductsModalOpen}>
        <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <DialogTitle className="text-2xl font-bold">Ürünler</DialogTitle>
          </div>
          <div className="flex-1 overflow-hidden">
            <ProductsSection
              products={products}
              onProductsChange={setProducts}
              current={invoiceData.current}
              warehouseId={invoiceData.warehouseId}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isExpensesModalOpen} onOpenChange={setIsExpensesModalOpen}>
        <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <DialogTitle className="text-2xl font-bold">Masraflar</DialogTitle>
          </div>
          <div className="flex-1 overflow-hidden">
            <ExpenseSection
              expenses={expenses}
              onExpensesChange={setExpenses}
              current={invoiceData.current}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesInvoice;
