"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import CustomerSection from "./CustomerSection";
import InvoiceForm from "./InvoiceForm";
import ExpenseSection from "./ExpenseSection";
import PaymentSection from "./PaymentSection";
import { ExpenseItem, InvoiceFormData, StockItem } from "./types";
import { PaymentDetails } from "./PaymentSection/types";
import { usePurchaseInvoice } from "@/hooks/usePurchaseInvoice";
import { InvoiceDetailResponse } from "@/types/invoice-detail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer, Maximize2, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { printInvoice } from "@/lib/services/print/invoice";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import ProductSelectionDialog from "./ProductsSection/ProductSelectionDialog";
import ProductTable from "./ProductsSection/ProductTable";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface PurchaseInvoiceProps {
  tabId: string;
}

const PurchaseInvoice: React.FC<PurchaseInvoiceProps> = ({ tabId }) => {
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
  const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);
  const [isExpensesModalOpen, setIsExpensesModalOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showCurrentAlert, setShowCurrentAlert] = useState(true);
  const [showInvoiceAlert, setShowInvoiceAlert] = useState(false);
  const [showBranchWarehouseAlert, setShowBranchWarehouseAlert] =
    useState(false);

  // Load customer data from localStorage if available (from Current Operations)
  useEffect(() => {
    const savedCurrentData = localStorage.getItem(
      `currentPurchaseInvoice-${tabId}`
    );
    if (savedCurrentData) {
      try {
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
        localStorage.removeItem(`currentPurchaseInvoice-${tabId}`);
      } catch (error) {
        console.error("Error parsing current data:", error);
      }
    }
  }, [tabId]);

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
      localStorage.setItem(
        `purchaseInvoiceFormData-${tabId}`,
        JSON.stringify(formData)
      );
    }
  }, [invoiceData, products, expenses, payments, tabId]);

  // Form verilerini localStorage'dan yükleme
  useEffect(() => {
    const savedFormData = localStorage.getItem(
      `purchaseInvoiceFormData-${tabId}`
    );
    localStorage.removeItem(`purchaseInvoiceFormData-${tabId}`);
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
  }, [tabId]);

  const handleSave = async () => {
    if (!invoiceData.invoiceNo) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Lütfen fatura numarası giriniz",
      });

      // InvoiceForm bileşenine hata durumunu iletmek için state'i güncelle
      setInvoiceData((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          invoiceNo: true,
        },
      }));

      return;
    }

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
        localStorage.removeItem(`purchaseInvoiceFormData-${tabId}`);
      }
    }
  };

  const handleProductsAdd = (newProducts: StockItem[]) => {
    setProducts((prevProducts) => {
      // Mevcut ürünlerin stockId'lerini bir Map'e alalım
      const existingProducts = new Map(prevProducts.map((p) => [p.stockId, p]));
      const updatedProducts: StockItem[] = [];
      const existingUpdated: StockItem[] = [];

      // Yeni ürünleri ters sırada işleyelim ve her ürünü sadece bir kez ekleyelim
      const processedIds = new Set<string>();
      [...newProducts].reverse().forEach((newProduct) => {
        // Eğer bu ürün zaten işlendiyse, atla
        if (processedIds.has(newProduct.stockId)) {
          return;
        }
        processedIds.add(newProduct.stockId);

        const existingProduct = existingProducts.get(newProduct.stockId);

        if (existingProduct) {
          // Eğer ürün zaten varsa, miktarını artır ve yeni özellikleri güncelle
          const updatedProduct = {
            ...existingProduct,
            quantity: existingProduct.quantity + 1,
            vatAmount:
              (existingProduct.quantity + 1) *
              existingProduct.unitPrice *
              (existingProduct.vatRate / 100),
            totalAmount:
              (existingProduct.quantity + 1) *
              existingProduct.unitPrice *
              (1 + existingProduct.vatRate / 100),
          };
          existingUpdated.push(updatedProduct);
          existingProducts.delete(newProduct.stockId);
        } else {
          // Yeni ürünü ekle
          updatedProducts.push(newProduct);
        }
      });

      // Güncellenen mevcut ürünleri en başa, yeni ürünleri onların ardına ve kalan ürünleri en sona ekle
      return [
        ...existingUpdated,
        ...updatedProducts,
        ...Array.from(existingProducts.values()),
      ];
    });

    setIsDialogOpen(false);
  };

  const handleProductUpdate = (index: number, updates: Partial<StockItem>) => {
    setProducts((prevProducts) => {
      const updatedProducts = [...prevProducts];
      updatedProducts[index] = { ...updatedProducts[index], ...updates };

      const quantity = updates.quantity ?? updatedProducts[index].quantity;
      const unitPrice = updates.unitPrice ?? updatedProducts[index].unitPrice;
      const vatRate = updates.vatRate ?? updatedProducts[index].vatRate;

      const subtotal = quantity * unitPrice;
      const vatAmount = subtotal * (vatRate / 100);
      updatedProducts[index].vatAmount = vatAmount;
      updatedProducts[index].totalAmount = subtotal + vatAmount;

      return updatedProducts;
    });
  };

  const handleProductDelete = (index: number) => {
    setProducts((prevProducts) => prevProducts.filter((_, i) => i !== index));
  };

  const ProductsTableSection = () => {
    return (
      <div className="flex flex-col">
        <div className="flex-1 min-h-0 border rounded-md overflow-hidden">
          <ProductTable
            products={products}
            onUpdate={handleProductUpdate}
            onDelete={handleProductDelete}
          />
        </div>
      </div>
    );
  };

  // Current seçildiğinde
  useEffect(() => {
    if (invoiceData.current) {
      setShowCurrentAlert(false);
      setShowInvoiceAlert(true);
      setShowBranchWarehouseAlert(true);
    }
  }, [invoiceData.current]);

  // Fatura no, depo ve şube seçildiğinde
  useEffect(() => {
    if (
      invoiceData.invoiceNo &&
      invoiceData.branchCode &&
      invoiceData.warehouseId
    ) {
      setShowInvoiceAlert(false);
      setShowBranchWarehouseAlert(false);
    }
  }, [invoiceData.invoiceNo, invoiceData.branchCode, invoiceData.warehouseId]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4 gap-4">
      <div className="flex items-center justify-between shrink-0 mb-2">
        <h2 className="text-2xl font-bold">
          {isEditMode ? "Fatura Düzenle" : "Alış Faturası"}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              try {
                printInvoice(
                  {
                    ...invoiceData,
                    items: products.length > 0 ? products : undefined,
                    expenses: expenses.length > 0 ? expenses : undefined,
                    payments,
                  },
                  {
                    title: "Alış Faturası",
                    type: "purchase",
                    hideProductsTable: products.length === 0,
                    hideExpensesTable: expenses.length === 0,
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
            disabled={
              !invoiceData.current ||
              (products.length === 0 && expenses.length === 0)
            }
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
          {showCurrentAlert && (
            <Alert variant="destructive" className="mb-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Lütfen önce cari seçiniz</AlertDescription>
            </Alert>
          )}

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
            {showInvoiceAlert && (
              <Alert variant="destructive" className="mb-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Lütfen fatura numarası giriniz
                </AlertDescription>
              </Alert>
            )}

            {showBranchWarehouseAlert && (
              <Alert variant="destructive" className="mb-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Lütfen şube ve depo seçiniz</AlertDescription>
              </Alert>
            )}

            <Card className="p-4 overflow-hidden flex flex-col h-[calc(25vh)]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Ürünler</h3>
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-[#84CC16] hover:bg-[#65A30D]"
                    disabled={!invoiceData.current || !invoiceData.warehouseId}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ürün Ekle
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsProductsModalOpen(true)}
                  >
                    <Maximize2 className="h-4 w-4 mr-2" />
                    Tam Ekran
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-auto">
                <ProductsTableSection />
              </div>
            </Card>

            <Card className="p-4 overflow-hidden flex flex-col h-[calc(25vh)]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Masraflar</h3>
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      const newExpense: ExpenseItem = {
                        id: crypto.randomUUID(),
                        expenseCode: "",
                        expenseName: "",
                        price: 0,
                        currency: "TRY",
                      };
                      setExpenses([...expenses, newExpense]);
                    }}
                    className="bg-[#84CC16] hover:bg-[#65A30D]"
                    disabled={!invoiceData.current}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Masraf Ekle
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsExpensesModalOpen(true)}
                  >
                    <Maximize2 className="h-4 w-4 mr-2" />
                    Tam Ekran
                  </Button>
                </div>
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
        </div>
      </div>

      <Dialog open={isProductsModalOpen} onOpenChange={setIsProductsModalOpen}>
        <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <DialogTitle className="text-2xl font-bold">Ürünler</DialogTitle>
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsDialogOpen(true)}
                className="bg-[#84CC16] hover:bg-[#65A30D] mr-4"
                disabled={!invoiceData.current || !invoiceData.warehouseId}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ürün Ekle
              </Button>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="h-full">
              <ProductsTableSection />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={isExpensesModalOpen} onOpenChange={setIsExpensesModalOpen}>
        <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <DialogTitle className="text-2xl font-bold">Masraflar</DialogTitle>
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  const newExpense: ExpenseItem = {
                    id: crypto.randomUUID(),
                    expenseCode: "",
                    expenseName: "",
                    price: 0,
                    currency: "TRY",
                  };
                  setExpenses([...expenses, newExpense]);
                }}
                className="bg-[#84CC16] hover:bg-[#65A30D] mr-8"
                disabled={!invoiceData.current}
              >
                <Plus className="h-4 w-4 mr-2" />
                Masraf Ekle
              </Button>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="h-full">
              <ExpenseSection
                expenses={expenses}
                onExpensesChange={setExpenses}
                current={invoiceData.current}
              />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {isDialogOpen && (
        <ProductSelectionDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onProductsSelect={handleProductsAdd}
          current={invoiceData.current}
          warehouseId={invoiceData.warehouseId}
        />
      )}
    </div>
  );
};

export default PurchaseInvoice;
