"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import DataGrid, {
  Column,
  Export,
  FilterRow,
  HeaderFilter,
  Grouping,
  GroupPanel,
  Paging,
  Scrolling,
  SearchPanel,
  Selection,
  Summary,
  TotalItem,
  Toolbar,
  Item,
  ColumnChooser,
  ColumnFixing,
  StateStoring,
  LoadPanel,
  Lookup,
} from "devextreme-react/data-grid";
import { Workbook } from "exceljs";
import { saveAs } from "file-saver-es";
import { exportDataGrid } from "devextreme/excel_exporter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { documentTypes, warehouses, branches, currencies } from "./data";
import { StockMovement } from "./types";
import { useToast } from "@/hooks/use-toast";

interface MovementsGridProps {
  type: "previous-purchases" | "previous-sales" | "orders" | "all-movements";
}

const getEndpoint = (type: MovementsGridProps["type"]) => {
  switch (type) {
    case "orders":
      return `${process.env.BASE_URL}/stockMovements/orders`;
    case "previous-sales":
      return `${process.env.BASE_URL}/stockMovements/sales`;
    case "previous-purchases":
      return `${process.env.BASE_URL}/stockMovements/purchase`;
    default:
      return `${process.env.BASE_URL}/stockMovements`;
  }
};

const MovementsGrid: React.FC<MovementsGridProps> = ({ type }) => {
  const { toast } = useToast();
  const dataGridRef = useRef<DataGrid>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMovements = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = getEndpoint(type);
      const response = await fetch(endpoint);

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
          : "An error occurred while fetching data"
      );
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch stock movements. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [type, toast]);

  useEffect(() => {
    fetchMovements();

    // Listen for refresh events
    const handleRefresh = () => {
      fetchMovements();
    };

    window.addEventListener("refreshMovements", handleRefresh);
    return () => {
      window.removeEventListener("refreshMovements", handleRefresh);
    };
  }, [fetchMovements]);

  const onExporting = useCallback((e: any) => {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Stok Hareketleri");

    exportDataGrid({
      component: e.component,
      worksheet,
      autoFilterEnabled: true,
      customizeCell: ({ gridCell, excelCell }: any) => {
        if (gridCell.rowType === "data") {
          if (typeof gridCell.value === "number") {
            excelCell.numFmt = "#,##0.00";
          } else if (gridCell.value instanceof Date) {
            excelCell.numFmt = "dd/mm/yyyy";
          }
        }
      },
    }).then(() => {
      workbook.xlsx.writeBuffer().then((buffer) => {
        saveAs(
          new Blob([buffer], { type: "application/octet-stream" }),
          "StokHareketleri.xlsx"
        );
      });
    });
  }, []);

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
    <DataGrid
      ref={dataGridRef}
      dataSource={movements}
      showBorders={true}
      showRowLines={true}
      showColumnLines={true}
      rowAlternationEnabled={true}
      allowColumnReordering={true}
      allowColumnResizing={true}
      columnResizingMode="widget"
      columnAutoWidth={true}
      columnHidingEnabled={true}
      wordWrapEnabled={true}
      height="calc(100vh - 250px)"
      onExporting={onExporting}
    >
      <StateStoring
        enabled={true}
        type="localStorage"
        storageKey={`stockMovementsGrid-${type}`}
      />
      <LoadPanel enabled={true} />
      <Selection mode="multiple" showCheckBoxesMode="always" />
      <FilterRow visible={true} />
      <HeaderFilter visible={true} />
      <GroupPanel visible={true} />
      <Grouping autoExpandAll={false} />
      <ColumnChooser enabled={true} mode="select" />
      <ColumnFixing enabled={true} />
      <Scrolling mode="virtual" rowRenderingMode="virtual" />
      <Paging enabled={false} />
      <SearchPanel visible={true} width={240} placeholder="Ara..." />
      <Export enabled={true} allowExportSelectedData={true} />

      <Column
        dataField="createdAt"
        caption="Tarih"
        dataType="datetime"
        format="dd.MM.yyyy HH:mm"
      />
      <Column dataField="documentNo" caption="Belge No" />
      <Column dataField="documentType" caption="Belge Tipi">
        <Lookup dataSource={documentTypes} />
      </Column>
      <Column dataField="warehouseCode" caption="Depo">
        <Lookup dataSource={warehouses} />
      </Column>
      <Column dataField="currentCode" caption="Cari" />
      <Column dataField="productCode" caption="Stok Kodu" />
      <Column dataField="unitOfMeasure" caption="Birim" />
      <Column
        dataField="quantity"
        caption="Miktar"
        dataType="number"
        format="#,##0.##"
        calculateCellValue={(data: StockMovement) => parseFloat(data.quantity)}
      />
      <Column
        dataField="unitPrice"
        caption="Birim Fiyat"
        dataType="number"
        format="#,##0.00"
        calculateCellValue={(data: StockMovement) => parseFloat(data.unitPrice)}
      />
      <Column
        dataField="totalPrice"
        caption="Toplam"
        dataType="number"
        format="#,##0.00"
        calculateCellValue={(data: StockMovement) =>
          parseFloat(data.totalPrice)
        }
      />
      <Column dataField="description" caption="Açıklama" />
      <Column dataField="branchCode" caption="Şube">
        <Lookup dataSource={branches} />
      </Column>
      <Column dataField="movementType" caption="Hareket Tipi" />
      <Column dataField="invoiceType" caption="Fatura Tipi" />

      <Summary>
        <TotalItem column="quantity" summaryType="sum" valueFormat="#,##0.##" />
        <TotalItem
          column="totalPrice"
          summaryType="sum"
          valueFormat="#,##0.00"
        />
      </Summary>

      <Toolbar>
        <Item name="groupPanel" location="before" />
        <Item name="searchPanel" location="after" />
        <Item name="exportButton" location="after" />
        <Item name="columnChooserButton" location="after" />
      </Toolbar>
    </DataGrid>
  );
};

export default MovementsGrid;
