"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import ProductSearch from "./ProductSearch";
import Cart from "./Cart";
import CustomerSection from "./CustomerSection";
import PaymentSection from "./PaymentSection";
import { useQuickSales } from "./hooks/useQuickSales";
import { motion } from "framer-motion";
import { ShoppingCart, User, CreditCard } from "lucide-react";

const QuickSales: React.FC = () => {
  const {
    cart,
    customer,
    addToCart,
    updateCartItem,
    removeFromCart,
    setCustomer,
    processPayment,
    loading,
  } = useQuickSales();

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] overflow-hidden">
      <div className="flex justify-between items-center mb-4 p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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

      <div className="grid grid-cols-12 gap-4 p-4 h-full overflow-hidden">
        <motion.div
          className="col-span-8 space-y-4 h-full overflow-hidden"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-4 shadow-lg border-muted">
            <ProductSearch onProductSelect={addToCart} />
          </Card>

          <Card className="flex-1 p-4 shadow-lg border-muted overflow-hidden flex flex-col">
            <Cart
              items={cart}
              onUpdateItem={updateCartItem}
              onRemoveItem={removeFromCart}
            />
          </Card>
        </motion.div>

        <motion.div
          className="col-span-4 space-y-4 h-full overflow-hidden"
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

          <Card className="p-4 shadow-lg border-muted bg-gradient-to-br from-background to-muted/50">
            <div className="flex items-center space-x-2 mb-4">
              <CreditCard className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Ödeme</h3>
            </div>
            <PaymentSection
              cart={cart}
              onProcessPayment={processPayment}
              loading={loading}
            />
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default QuickSales;
