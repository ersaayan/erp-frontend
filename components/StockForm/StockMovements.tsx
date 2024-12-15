"use client";

import React, { useEffect, useState } from "react";
import DataGrid, {
  Column,
  ColumnChooser,
  FilterRow,
  HeaderFilter,
  Paging,
  Scrolling,
  SearchPanel,
  Selection,
  LoadPanel,
  StateStoring,
  Summary,
  TotalItem,
} from "devextreme-react/data-grid";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { Card } from "../ui/card";

interface StockMovement {
  id: string;
  productCode: string;
  warehouseCode: string;
  branchCode: string;
  currentCode: string;
  documentType: string;
  invoiceType: string;
  movementType: string;
  documentNo: string;
  gcCode: string;
  type: string | null;
  description: string;
  quantity: string;
  unitPrice: string;
  totalPrice: string;
  unitOfMeasure: string;
  outWarehouseCode: string | null;
  priceListId: string;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string;
  updatedBy: string | null;
}

interface StockMovementsProps {
  productCode: string;
}

const StockMovements: React.FC<StockMovementsProps> = ({ productCode }) => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.BASE_URL}/stockMovements/byProductCode/${productCode}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch stock movements");
        }

        const data = await response.json();
        setMovements(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while fetching movements"
        );
      } finally {
        setLoading(false);
      }
    };

    if (productCode) {
      fetchMovements();
    }
  }, [productCode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading movements...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="mt-4 p-4 h-full">
      <DataGrid
        dataSource={movements}
        showBorders={true}
        showRowLines={true}
        showColumnLines={true}
        rowAlternationEnabled={true}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnAutoWidth={true}
        wordWrapEnabled={true}
        height="calc(100vh - 400px)"
      >
        <StateStoring
          enabled={true}
          type="localStorage"
          storageKey="stockMovementsGrid"
        />
        <LoadPanel enabled={true} />
        <Selection mode="multiple" />
        <FilterRow visible={true} />
        <HeaderFilter visible={true} />
        <SearchPanel visible={true} width={240} placeholder="Ara..." />
        <ColumnChooser enabled={true} mode="select" />
        <Scrolling mode="virtual" />
        <Paging enabled={false} />

        <Column
          dataField="createdAt"
          caption="Tarih"
          dataType="datetime"
          format="dd.MM.yyyy HH:mm"
        />
        <Column dataField="documentNo" caption="Belge No" />
        <Column dataField="documentType" caption="Belge Tipi" />
        <Column dataField="invoiceType" caption="Fatura Tipi" />
        <Column dataField="movementType" caption="Hareket Tipi" />
        <Column dataField="currentCode" caption="Cari Kodu" />
        <Column dataField="warehouseCode" caption="Depo" />
        <Column dataField="description" caption="Açıklama" />
        <Column
          dataField="quantity"
          caption="Miktar"
          dataType="number"
          format="#,##0.##"
        />
        <Column dataField="unitOfMeasure" caption="Birim" />
        <Column
          dataField="unitPrice"
          caption="Birim Fiyat"
          dataType="number"
          format="#,##0.00"
        />
        <Column
          dataField="totalPrice"
          caption="Toplam"
          dataType="number"
          format="#,##0.00"
        />
        <Column dataField="branchCode" caption="Şube" />

        <Summary>
          <TotalItem
            column="quantity"
            summaryType="sum"
            valueFormat="#,##0.##"
          />
          <TotalItem
            column="totalPrice"
            summaryType="sum"
            valueFormat="#,##0.00"
          />
        </Summary>
      </DataGrid>
    </Card>
  );
};

export default StockMovements;
