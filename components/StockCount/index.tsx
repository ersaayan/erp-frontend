"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import WarehouseSelect from "./WarehouseSelect";
import SearchSection from "./SearchSection";
import CountedProductsTable from "./CountedProductsTable";
import SubmitSection from "./SubmitSection";
import { useStockCount } from "./hooks/useStockCount";
import { CountedProduct } from "./types";

const StockCount: React.FC = () => {
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("");
  const [selectedBranchCode, setSelectedBranchCode] = useState<string>("");
  const {
    countedProducts,
    loading,
    addProduct,
    updateProductQuantity,
    removeProduct,
    submitCount,
  } = useStockCount();

  const handleWarehouseSelect = (warehouseId: string) => {
    setSelectedWarehouseId(warehouseId);
  };

  const handleBranchSelect = (branchCode: string) => {
    setSelectedBranchCode(branchCode);
    // Reset warehouse selection when branch changes
    setSelectedWarehouseId("");
  };

  const handleProductAdd = (product: CountedProduct) => {
    addProduct(product);
  };

  return (
    <div className="grid-container">
      <Card className="p-6">
        <div className="space-y-6">
          <WarehouseSelect
            onWarehouseSelect={handleWarehouseSelect}
            onBranchSelect={handleBranchSelect}
            selectedBranchCode={selectedBranchCode}
          />

          <SearchSection
            warehouseId={selectedWarehouseId}
            onProductAdd={handleProductAdd}
            disabled={!selectedWarehouseId || !selectedBranchCode}
          />

          <CountedProductsTable
            products={countedProducts}
            onQuantityChange={updateProductQuantity}
            onRemove={removeProduct}
          />

          <SubmitSection
            onSubmit={() =>
              submitCount(selectedWarehouseId, selectedBranchCode)
            }
            disabled={
              !selectedWarehouseId ||
              !selectedBranchCode ||
              countedProducts.length === 0 ||
              loading
            }
            loading={loading}
          />
        </div>
      </Card>
    </div>
  );
};

export default StockCount;
