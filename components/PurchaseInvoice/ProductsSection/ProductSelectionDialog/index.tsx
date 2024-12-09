// PurchaseInvoice/ProductsSection/ProductSelectionDialog/index.tsx
import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Current } from "@/components/CurrentList/types";
import { StockItem } from "../../types";
import ProductSelectionGrid from "./ProductSelectionGrid";
import { useProductSelection } from "./hooks/useProductSelection";

interface ProductSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  warehouseId: string;
  current: Current | null;
  existingProducts: StockItem[];
  onProductsSelect: (products: StockItem[]) => void;
}

const ProductSelectionDialog: React.FC<ProductSelectionDialogProps> = ({
  isOpen,
  onClose,
  warehouseId,
  current,
  existingProducts,
  onProductsSelect,
}) => {
  const {
    results,
    loading,
    selectedProducts,
    page,
    totalPages,
    fetchProducts,
    handleProductSelection,
    handleAddSelectedProducts,
  } = useProductSelection({
    warehouseId,
    current,
    existingProducts,
    onProductsSelect,
  });

  useEffect(() => {
    if (isOpen && warehouseId && current) {
      fetchProducts(1);
    }
  }, [isOpen, warehouseId, current, fetchProducts]);

  const handleConfirm = () => {
    handleAddSelectedProducts();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Ürün Seçimi</DialogTitle>
        </DialogHeader>

        <ProductSelectionGrid
          products={results}
          loading={loading}
          selectedProducts={selectedProducts}
          onProductSelect={handleProductSelection}
          page={page}
          totalPages={totalPages}
          onPageChange={fetchProducts}
          existingProducts={existingProducts}
        />

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            İptal
          </Button>
          <Button
            onClick={handleAddSelectedProducts}
            disabled={selectedProducts.length === 0}
            className="bg-[#84CC16] hover:bg-[#65A30D]"
          >
            Seçili Ürünleri Ekle
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductSelectionDialog;
