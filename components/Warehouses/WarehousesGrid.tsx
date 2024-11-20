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
import { Warehouse } from "./types";
import { useWarehouseDialog } from "./useWarehouseDialog";

const WarehousesGrid: React.FC = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { openDialog } = useWarehouseDialog();

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:1303/warehouses");
      if (!response.ok) {
        throw new Error("Failed to fetch warehouses");
      }
      const data = await response.json();
      setWarehouses(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while fetching warehouses"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();

    // Listen for refresh events
    const handleRefresh = () => {
      fetchWarehouses();
    };

    window.addEventListener("refreshWarehouses", handleRefresh);

    return () => {
      window.removeEventListener("refreshWarehouses", handleRefresh);
    };
  }, []);

  const handleRowDblClick = (e: any) => {
    openDialog(e.data);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading warehouses...</span>
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
    <DataGrid
      dataSource={warehouses}
      showBorders={true}
      showRowLines={true}
      showColumnLines={true}
      rowAlternationEnabled={true}
      allowColumnReordering={true}
      allowColumnResizing={true}
      columnAutoWidth={true}
      wordWrapEnabled={true}
      height="calc(100vh - 250px)"
      onRowDblClick={handleRowDblClick}
    >
      <StateStoring
        enabled={true}
        type="localStorage"
        storageKey="warehousesGrid"
      />
      <LoadPanel enabled={true} />
      <Selection mode="multiple" />
      <FilterRow visible={true} />
      <HeaderFilter visible={true} />
      <SearchPanel visible={true} width={240} placeholder="Ara..." />
      <ColumnChooser enabled={true} mode="select" />
      <Scrolling mode="virtual" />
      <Paging enabled={false} />

      <Column dataField="warehouseName" caption="Depo Adı" />
      <Column dataField="warehouseCode" caption="Depo Kodu" />
      <Column dataField="address" caption="Adres" />
      <Column dataField="countryCode" caption="Ülke Kodu" />
      <Column dataField="city" caption="Şehir" />
      <Column dataField="district" caption="İlçe" />
      <Column dataField="phone" caption="Telefon" />
      <Column dataField="email" caption="E-posta" />
      <Column dataField="companyCode" caption="Firma Kodu" />
      <Column dataField="stockCount" caption="Stok Sayısı" />
      <Column dataField="totalStock" caption="Toplam Stok" format="#,##0" />
      <Column
        dataField="createdAt"
        caption="Oluşturma Tarihi"
        dataType="datetime"
        format="dd.MM.yyyy HH:mm"
      />
      <Column
        dataField="updatedAt"
        caption="Güncelleme Tarihi"
        dataType="datetime"
        format="dd.MM.yyyy HH:mm"
      />

      <Summary>
        <TotalItem column="stockCount" summaryType="sum" valueFormat="#,##0" />
        <TotalItem column="totalStock" summaryType="sum" valueFormat="#,##0" />
      </Summary>
    </DataGrid>
  );
};

export default WarehousesGrid;
