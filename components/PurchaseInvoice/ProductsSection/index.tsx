//PurchaseInvoice/ProductsSection/index.tsx
"use client";

import React, { useState } from "react";
import { StockItem } from "../types";
import { Current } from "@/components/CurrentList/types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ProductSelectionDialog from "./ProductSelectionDialog";
import ProductsGrid from "./ProductsGrid";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const handleProductUpdate = (updatedProduct: StockItem) => {
    setProducts(
      products.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
  };

  const handleProductRemove = (productId: string) => {
    setProducts(products.filter((product) => product.id !== productId));
    toast({
      title: "Success",
      description: "Ürün başarıyla silindi",
    });
  };

  const handleBulkRemove = (productIds: string[]) => {
    setProducts(products.filter((product) => !productIds.includes(product.id)));
    toast({
      title: "Success",
      description: `${productIds.length} ürün başarıyla silindi`,
    });
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
    toast({
      title: "Success",
      description: `${newProducts.length} ürün başarıyla eklendi`,
    });
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

      <ProductsGrid
        products={products}
        onProductUpdate={handleProductUpdate}
        onProductRemove={handleProductRemove}
        onBulkRemove={handleBulkRemove}
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
