import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProductSelectionForm from "./ProductSelectionForm";
import { useProductSelectionDialog } from "./useProductSelectionDialog";
import { Current } from "@/components/CurrentList/types";

interface ProductSelectionDialogProps {
  onProductsSelected: (products: any[]) => void;
  customer: Current | null;
  selectedWarehouseId?: string;
}

const ProductSelectionDialog: React.FC<ProductSelectionDialogProps> = ({
  onProductsSelected,
  customer,
  selectedWarehouseId,
}) => {
  const { isOpen, closeDialog } = useProductSelectionDialog();

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Ürün Seçimi</DialogTitle>
        </DialogHeader>
        <ProductSelectionForm
          customer={customer}
          selectedWarehouseId={selectedWarehouseId}
          onProductsSelected={onProductsSelected}
          onClose={closeDialog}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProductSelectionDialog;
