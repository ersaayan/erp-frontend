"use client";

import React, { useState } from "react";
import { StockItem } from "../types";
import { Current } from "@/components/CurrentList/types";
import ProductsTable from "./ProductsTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ProductSelectionDialog from "./ProductSelectionDialog";

interface ProductsSectionProps {
  products: StockItem[];
  setProducts: (products: StockItem[]) => void;
  warehouseId: string;
  current: Current | null;
}

const ProductsSection: React.FC<ProductsSectionProps> = ({
  products,
  setProducts,
  warehouseId,
  current,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleProductUpdate = (updatedProduct: StockItem) => {
    setProducts(
      products.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
  };

  const handleProductRemove = (productId: string) => {
    setProducts(products.filter((product) => product.id !== productId));
  };

  const handleProductsSelect = (newProducts: StockItem[]) => {
    const updatedProducts = [...products];

    newProducts.forEach((newProduct) => {
      const existingIndex = updatedProducts.findIndex(
        (p) => p.stockId === newProduct.stockId
      );

      if (existingIndex !== -1) {
        // Update existing product quantity
        const existingProduct = updatedProducts[existingIndex];
        const newQuantity = existingProduct.quantity + 1;
        updatedProducts[existingIndex] = {
          ...existingProduct,
          quantity: newQuantity,
          vatAmount:
            (newQuantity *
              existingProduct.unitPrice *
              existingProduct.vatRate) /
            100,
          totalAmount:
            newQuantity * existingProduct.unitPrice +
            (newQuantity *
              existingProduct.unitPrice *
              existingProduct.vatRate) /
              100,
        };
      } else {
        // Add new product
        updatedProducts.push(newProduct);
      }
    });

    setProducts(updatedProducts);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Ürünler</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDialogOpen(true)}
          disabled={!warehouseId || !current}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ürün Ekle
        </Button>
      </div>

      <ProductsTable
        products={products}
        onProductUpdate={handleProductUpdate}
        onProductRemove={handleProductRemove}
      />

      <ProductSelectionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        warehouseId={warehouseId}
        current={current}
        existingProducts={products}
        onProductsSelect={handleProductsSelect}
      />
    </div>
  );
};

export default ProductsSection;
