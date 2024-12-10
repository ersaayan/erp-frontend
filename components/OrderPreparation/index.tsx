"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import CustomerSection from "./CustomerSection";
import OrderForm from "./OrderForm";
import ProductsSection from "./ProductsSection";
import { OrderFormData, StockItem } from "./types";

const OrderPreparation: React.FC = () => {
  const [orderData, setOrderData] = useState<OrderFormData>({
    orderNo: "",
    orderDate: new Date(),
    deliveryDate: new Date(),
    branchCode: "",
    warehouseId: "",
    description: "",
    current: null,
  });

  const [products, setProducts] = useState<StockItem[]>([]);

  // Load customer data from localStorage if available (from Current Operations)
  useEffect(() => {
    const savedCurrentData = localStorage.getItem("currentOrderPreparation");
    if (savedCurrentData) {
      const currentData = JSON.parse(savedCurrentData);
      setOrderData((prev) => ({
        ...prev,
        current: {
          id: currentData.id,
          currentCode: currentData.currentCode,
          currentName: currentData.currentName,
          priceList: currentData.priceList,
        },
      }));
      localStorage.removeItem("currentOrderPreparation");
    }
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4 gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sipariş Hazırlama</h1>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        <div className="flex flex-col flex-1 gap-4 overflow-auto">
          <Card className="p-4">
            <CustomerSection
              customer={orderData.current}
              onCustomerChange={(customer) =>
                setOrderData((prev) => ({ ...prev, current: customer }))
              }
            />
          </Card>

          <Card className="p-4">
            <OrderForm
              data={orderData}
              onChange={(data) => setOrderData(data)}
            />
          </Card>

          <Card className="flex-1 p-4 overflow-hidden">
            <ProductsSection
              products={products}
              onProductsChange={setProducts}
              current={orderData.current}
              warehouseId={orderData.warehouseId}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderPreparation;
