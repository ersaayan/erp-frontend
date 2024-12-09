"use client";

import React, { useCallback, useRef } from "react";
import DataGrid, {
  Column,
  Editing,
  Lookup,
  Paging,
  FilterRow,
  HeaderFilter,
  Selection,
  Summary,
  TotalItem,
  Export,
  Toolbar,
  Item,
  SearchPanel,
  ColumnChooser,
  StateStoring,
} from "devextreme-react/data-grid";
import { Workbook } from "exceljs";
import { saveAs } from "file-saver-es";
import { exportDataGrid } from "devextreme/excel_exporter";
import { StockItem } from "../types";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface ProductsGridProps {
  products: StockItem[];
  onProductUpdate: (product: StockItem) => void;
  onProductRemove: (productId: string) => void;
  onBulkRemove: (productIds: string[]) => void;
}

const ProductsGrid: React.FC<ProductsGridProps> = ({
  products,
  onProductUpdate,
  onProductRemove,
  onBulkRemove,
}) => {
  const dataGridRef = useRef<DataGrid>(null);
  const [selectedRowKeys, setSelectedRowKeys] = React.useState<string[]>([]);

  const calculateRowValues = useCallback((rowData: StockItem) => {
    const quantity = rowData.quantity || 0;
    const unitPrice = rowData.unitPrice || 0;
    const vatRate = rowData.vatRate || 0;
    const discountRate = rowData.discountRate || 0;

    const subtotal = quantity * unitPrice;
    const discountAmount = (subtotal * discountRate) / 100;
    const vatableAmount = subtotal - discountAmount;
    const vatAmount = (vatableAmount * vatRate) / 100;
    const totalAmount = vatableAmount + vatAmount;

    return {
      discountAmount,
      vatAmount,
      totalAmount,
    };
  }, []);

  const onRowUpdated = useCallback(
    (e: any) => {
      const updatedData = { ...e.data };
      const calculations = calculateRowValues(updatedData);

      const finalData: StockItem = {
        ...updatedData,
        ...calculations,
      };

      onProductUpdate(finalData);
    },
    [calculateRowValues, onProductUpdate]
  );

  const onExporting = useCallback((e: any) => {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Products");

    exportDataGrid({
      component: e.component,
      worksheet,
      autoFilterEnabled: true,
      customizeCell: ({ gridCell, excelCell }: any) => {
        if (gridCell.rowType === "data") {
          if (typeof gridCell.value === "number") {
            excelCell.numFmt = "#,##0.00";
          }
        }
      },
    }).then(() => {
      workbook.xlsx.writeBuffer().then((buffer) => {
        saveAs(
          new Blob([buffer], { type: "application/octet-stream" }),
          "Products.xlsx"
        );
      });
    });
  }, []);

  return (
    <DataGrid
      ref={dataGridRef}
      dataSource={products}
      showBorders={true}
      showRowLines={true}
      showColumnLines={true}
      rowAlternationEnabled={true}
      allowColumnReordering={true}
      allowColumnResizing={true}
      columnAutoWidth={true}
      wordWrapEnabled={true}
      onRowUpdated={onRowUpdated}
      onExporting={onExporting}
      selectedRowKeys={selectedRowKeys}
      onSelectionChanged={(e) =>
        setSelectedRowKeys(e.selectedRowKeys as string[])
      }
    >
      <StateStoring
        enabled={true}
        type="localStorage"
        storageKey="purchaseInvoiceProductsGrid"
      />
      <Selection mode="multiple" showCheckBoxesMode="always" />
      <FilterRow visible={true} />
      <HeaderFilter visible={true} />
      <SearchPanel visible={true} width={240} placeholder="Ara..." />
      <ColumnChooser enabled={true} mode="select" />
      <Paging defaultPageSize={10} />
      <Export enabled={true} allowExportSelectedData={true} />
      <Editing
        mode="cell"
        allowUpdating={true}
        allowDeleting={false}
        useIcons={true}
      />

      <Column dataField="stockCode" caption="Ürün Kodu" allowEditing={false} />
      <Column dataField="stockName" caption="Ürün Adı" allowEditing={false} />
      <Column
        dataField="quantity"
        caption="Miktar"
        dataType="number"
        format="#,##0.##"
      />
      <Column dataField="unit" caption="Birim" allowEditing={false} />
      <Column
        dataField="unitPrice"
        caption="Birim Fiyat"
        dataType="number"
        format="#,##0.00"
      />
      <Column
        dataField="vatRate"
        caption="KDV (%)"
        dataType="number"
        format="#,##0"
      />
      <Column
        dataField="vatAmount"
        caption="KDV Tutarı"
        dataType="number"
        format="#,##0.00"
        allowEditing={false}
      />
      <Column
        dataField="discountRate"
        caption="İskonto (%)"
        dataType="number"
        format="#,##0"
      />
      <Column
        dataField="discountAmount"
        caption="İskonto Tutarı"
        dataType="number"
        format="#,##0.00"
        allowEditing={false}
      />
      <Column
        dataField="totalAmount"
        caption="Toplam Tutar"
        dataType="number"
        format="#,##0.00"
        allowEditing={false}
      />
      <Column
        width={70}
        type="buttons"
        caption="İşlemler"
        cellRender={(cellData: any) => (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onProductRemove(cellData.data.id)}
            className="h-8 w-8 text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      />

      <Summary>
        <TotalItem column="quantity" summaryType="sum" valueFormat="#,##0.##" />
        <TotalItem
          column="vatAmount"
          summaryType="sum"
          valueFormat="#,##0.00"
        />
        <TotalItem
          column="discountAmount"
          summaryType="sum"
          valueFormat="#,##0.00"
        />
        <TotalItem
          column="totalAmount"
          summaryType="sum"
          valueFormat="#,##0.00"
        />
      </Summary>

      <Toolbar>
        <Item name="searchPanel" />
        <Item name="exportButton" />
        <Item name="columnChooserButton" />
        {selectedRowKeys.length > 0 && (
          <Item
            widget="dxButton"
            location="after"
            options={{
              icon: "trash",
              text: "Seçili Ürünleri Sil",
              onClick: () => onBulkRemove(selectedRowKeys),
            }}
          />
        )}
      </Toolbar>
    </DataGrid>
  );
};

export default ProductsGrid;
