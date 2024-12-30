"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ProductTable from "./ProductTable";
import ProductSelectionDialog from "./ProductSelectionDialog";
import { StockItem } from "../types";
import { Current } from "@/components/CurrentList/types";

interface ProductsSectionProps {
  products: StockItem[];
  onProductsChange: (products: StockItem[]) => void;
  current: Current | null;
  warehouseId: string;
}

const ProductsSection: React.FC<ProductsSectionProps> = ({
  products,
  onProductsChange,
  current,
  warehouseId,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleProductsAdd = (newProducts: StockItem[]) => {
    const updatedProducts = [...products];
    newProducts.forEach((newProduct) => {
      const existingIndex = products.findIndex(
        (p) => p.stockId === newProduct.stockId
      );
      if (existingIndex >= 0) {
        updatedProducts[existingIndex] = {
          ...updatedProducts[existingIndex],
          quantity:
            updatedProducts[existingIndex].quantity + newProduct.quantity,
          totalAmount:
            (updatedProducts[existingIndex].quantity + newProduct.quantity) *
            newProduct.unitPrice,
        };
      } else {
        updatedProducts.push(newProduct);
      }
    });

    onProductsChange(updatedProducts);
    setIsDialogOpen(false);
  };

  const handleProductUpdate = (index: number, updates: Partial<StockItem>) => {
    const updatedProducts = [...products];
    updatedProducts[index] = { ...updatedProducts[index], ...updates };

    const quantity = updates.quantity ?? updatedProducts[index].quantity;
    const unitPrice = updates.unitPrice ?? updatedProducts[index].unitPrice;
    const vatRate = updates.vatRate ?? updatedProducts[index].vatRate;

    const subtotal = quantity * unitPrice;
    const vatAmount = subtotal * (vatRate / 100);
    updatedProducts[index].vatAmount = vatAmount;
    updatedProducts[index].totalAmount = subtotal + vatAmount;

    onProductsChange(updatedProducts);
  };

  const handleProductDelete = (index: number) => {
    const updatedProducts = products.filter((_, i) => i !== index);
    onProductsChange(updatedProducts);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Ürünler</h2>
        <Button
          variant="default"
          size="sm"
          onClick={() => setIsDialogOpen(true)}
          className="bg-[#84CC16] hover:bg-[#65A30D]"
          disabled={!current || !warehouseId}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ürün Ekle
        </Button>
      </div>

      <div className="flex-1 min-h-0 border rounded-md">
        <ProductTable
          products={products}
          onUpdate={handleProductUpdate}
          onDelete={handleProductDelete}
        />
      </div>

      <ProductSelectionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onProductsSelect={handleProductsAdd}
        current={current}
        warehouseId={warehouseId}
      />
    </div>
  );
};

export default ProductsSection;
