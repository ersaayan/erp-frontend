"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import CustomerSection from "./CustomerSection";
import OrderForm from "./OrderForm";
import ProductsSection from "./ProductsSection";
import { OrderFormData, StockItem, Current } from "./types";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const OrderPreparation: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<OrderFormData>({
    current: null,
    orderNo: "",
    orderDate: new Date(),
    deliveryDate: new Date(),
    branchCode: "",
    warehouseId: "",
    description: "",
  });

  const [products, setProducts] = useState<StockItem[]>([]);

  // Load customer data from localStorage if available (from Current Operations)
  useEffect(() => {
    const savedCurrentData = localStorage.getItem("currentOrderData");
    if (savedCurrentData) {
      try {
        const currentData = JSON.parse(savedCurrentData);
        const current: Current = {
          id: currentData.id,
          currentCode: currentData.currentCode,
          currentName: currentData.currentName,
          currentType: currentData.currentType || "",
          institution: currentData.institution ? "true" : "false",
          identityNo: currentData.identityNo || "",
          taxNumber: currentData.taxNumber || "",
          taxOffice: currentData.taxOffice || "",
          title: currentData.title || "",
          name: currentData.name,
          surname: currentData.surname,
          webSite: currentData.webSite,
          birthOfDate: currentData.birthOfDate,
          kepAddress: currentData.kepAddress,
          mersisNo: currentData.mersisNo,
          sicilNo: currentData.sicilNo,
          priceListId: currentData.priceListId || "",
          createdAt: currentData.createdAt || "",
          updatedAt: currentData.updatedAt || "",
          createdBy: currentData.createdBy,
          updatedBy: currentData.updatedBy,
          priceList: currentData.priceList || {
            priceListName: "",
          },
          currentAddress: currentData.currentAddress,
          currentFinancial: currentData.currentFinancial,
          currentRisk: currentData.currentRisk,
          currentOfficials: currentData.currentOfficials,
        };
        setOrderData((prev) => ({ ...prev, current }));
        localStorage.removeItem("currentOrderData");
      } catch (error) {
        console.error("Error parsing current data:", error);
      }
    }
  }, []);

  const handleSave = async () => {
    try {
      if (!orderData.current) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Lütfen müşteri seçiniz",
        });
        return;
      }

      if (!orderData.branchCode || !orderData.warehouseId) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Lütfen şube ve depo seçiniz",
        });
        return;
      }

      if (products.length === 0) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Lütfen en az bir ürün ekleyiniz",
        });
        return;
      }

      setLoading(true);

      const payload = {
        orderNo: orderData.orderNo,
        orderDate: orderData.orderDate.toISOString(),
        deliveryDate: orderData.deliveryDate.toISOString(),
        branchCode: orderData.branchCode,
        warehouseId: orderData.warehouseId,
        description: orderData.description,
        currentCode: orderData.current.currentCode,
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
      };

      const response = await fetch(
        `${process.env.BASE_URL}/warehouses/orderPacking`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Sipariş kaydedilemedi");
      }

      toast({
        title: "Başarılı",
        description: "Sipariş başarıyla kaydedildi",
      });

      // Reset form
      setOrderData({
        orderNo: "",
        orderDate: new Date(),
        deliveryDate: new Date(),
        branchCode: "",
        warehouseId: "",
        description: "",
        current: null,
      });
      setProducts([]);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error instanceof Error ? error.message : "Bir hata oluştu",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4 gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sipariş Hazırlama</h1>
        <Button
          variant="default"
          onClick={handleSave}
          disabled={loading}
          className="bg-[#84CC16] hover:bg-[#65A30D]"
        >
          {loading && <div className="animate-spin mr-2">⌛</div>}
          <Save className="h-4 w-4 mr-2" />
          Kaydet
        </Button>
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
