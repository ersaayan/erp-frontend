"use client";

import React, { useState } from "react";
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

const QuickSales: React.FC = () => {
  const {
    cart,
    customer,
    payments,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    setCustomer,
    setPayments,
    processPayment,
  } = useQuickSales();

  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("");
  const [selectedBranchCode, setSelectedBranchCode] = useState<string>("");

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex justify-between items-center mb-4 p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <h2 className="text-2xl font-bold">Hızlı Satış</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            <span className="text-lg font-semibold">{cart.length} Ürün</span>
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
            />
            <ProductSearch
              onProductSelect={addToCart}
              warehouseId={selectedWarehouseId}
              disabled={!selectedWarehouseId}
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
              loading={loading}
              branchCode={selectedBranchCode}
              warehouseId={selectedWarehouseId}
            />
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default QuickSales;
