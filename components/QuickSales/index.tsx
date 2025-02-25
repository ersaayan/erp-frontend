"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import ProductSearch from "./ProductSearch";
import Cart from "./Cart";
import CustomerSection from "./CustomerSection";
import PaymentSection from "./PaymentSection";
import { useQuickSales } from "./hooks/useQuickSales";
import { motion } from "framer-motion";
import { ShoppingCart, User, CreditCard } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import WarehouseSelect from "./WarehouseSection/WarehouseSelect";
import { Badge } from "@/components/ui/badge";

interface QuickSalesProps {
  tabId: string;
}

const QuickSales: React.FC<QuickSalesProps> = ({ tabId }) => {
  const {
    cart,
    customer,
    payments,
    loading,
    isEditMode,
    addToCart,
    updateCartItem,
    removeFromCart,
    setCustomer,
    setPayments,
    processPayment,
    deleteOrder,
    setCart,
  } = useQuickSales();

  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("");
  const [selectedBranchCode, setSelectedBranchCode] = useState<string>("");

  // Add new function to fetch default customer
  const fetchDefaultCustomer = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.BASE_URL}/currents/search?query=Muhtelif`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to fetch default customer");

      const data = await response.json();

      // If Muhtelif customer exists, set it as current customer
      if (data && data.length > 0) {
        const muhtelifCustomer = data[0];
        setCustomer({
          id: muhtelifCustomer.id,
          name: muhtelifCustomer.currentName,
          code: muhtelifCustomer.currentCode,
          taxNumber: muhtelifCustomer.taxNumber,
          taxOffice: muhtelifCustomer.taxOffice,
          address: muhtelifCustomer.address,
          phone: muhtelifCustomer.phone,
          email: muhtelifCustomer.email,
          priceListId: muhtelifCustomer.priceListId,
          priceList: muhtelifCustomer.priceList
            ? {
                id: muhtelifCustomer.priceList.id,
                priceListName: muhtelifCustomer.priceList.priceListName,
                currency: muhtelifCustomer.priceList.currency,
                isVatIncluded: muhtelifCustomer.priceList.isVatIncluded,
              }
            : null,
        });
      }
    } catch (error) {
      console.error("Error fetching default customer:", error);
    }
  }, [setCustomer]);

  // Add useEffect to check for default customer on mount
  useEffect(() => {
    if (!customer) {
      fetchDefaultCustomer();
    }
  }, [customer, fetchDefaultCustomer]);

  // Form verilerini localStorage'a kaydetme
  useEffect(() => {
    if (cart.length > 0 || customer || payments.length > 0) {
      const formData = {
        cart,
        customer,
        payments,
      };
      localStorage.setItem(
        `quickSalesFormData-${tabId}`,
        JSON.stringify(formData)
      );
    }
  }, [cart, customer, payments, tabId]);

  // Form verilerini localStorage'dan yükleme
  useEffect(() => {
    const savedFormData = localStorage.getItem(`quickSalesFormData-${tabId}`);
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        if (parsedData.cart) setCart(parsedData.cart);
        if (parsedData.customer) setCustomer(parsedData.customer);
        if (parsedData.payments) setPayments(parsedData.payments);
      } catch (error) {
        console.error("Form verilerini yüklerken hata oluştu:", error);
      }
    }
  }, [tabId]);

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex justify-between items-center mb-4 p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          <h2 className="text-2xl font-bold">
            {isEditMode ? "Sipariş Düzenle" : "Hızlı Satış"}
          </h2>
          {isEditMode && (
            <Badge variant="secondary" className="ml-2">
              Düzenleme Modu
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            <span className="text-lg font-semibold">
              {cart.length} Ürün Kalemi
            </span>
          </div>
          {customer && (
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <span className="text-lg font-semibold">{customer.name}</span>
            </div>
          )}
        </div>
      </div>

      {!customer && (
        <Alert variant="destructive" className="mx-4 mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Lütfen işleme başlamadan önce bir müşteri seçin!
          </AlertDescription>
        </Alert>
      )}
      <div className="grid grid-cols-12 gap-4 p-4 overflow-hidden h-[calc(100%-4rem)]">
        <motion.div
          className="col-span-8 space-y-4 h-full overflow-hidden flex flex-col"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-4 shadow-lg border-muted">
            <WarehouseSelect
              onWarehouseSelect={(warehouseId: string, branchCode: string) => {
                setSelectedWarehouseId(warehouseId);
                setSelectedBranchCode(branchCode);
              }}
              customer={customer}
            />
            <ProductSearch
              onProductSelect={addToCart}
              warehouseId={selectedWarehouseId}
              disabled={!selectedWarehouseId || !customer}
              customer={customer}
            />
          </Card>

          <Card className="flex-1 p-4 shadow-lg border-muted overflow-hidden flex flex-col min-h-0">
            <Cart
              items={cart}
              onUpdateItem={updateCartItem}
              onRemoveItem={removeFromCart}
            />
          </Card>
        </motion.div>

        <motion.div
          className="col-span-4 space-y-4 h-full overflow-hidden flex flex-col"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="p-4 shadow-lg border-muted">
            <CustomerSection
              customer={customer}
              onCustomerSelect={setCustomer}
            />
          </Card>

          <Card className="flex-1 p-4 shadow-lg border-muted bg-gradient-to-br from-background to-muted/50 overflow-auto">
            <div className="flex items-center space-x-2 mb-4">
              <CreditCard className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Ödeme</h3>
            </div>
            <PaymentSection
              cart={cart}
              payments={payments}
              onPaymentsChange={setPayments}
              onProcessPayment={(payments) =>
                processPayment(
                  payments,
                  selectedBranchCode,
                  selectedWarehouseId
                )
              }
              onDelete={isEditMode ? deleteOrder : undefined}
              loading={loading}
              isEditMode={isEditMode}
            />
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default QuickSales;
