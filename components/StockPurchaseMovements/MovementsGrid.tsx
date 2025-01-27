"use client";

import React, { useRef, useCallback } from "react";
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
import { documentTypes, warehouses, branches } from "./data";
import { StockMovement } from "./types";

interface MovementsGridProps {
  movements: StockMovement[];
}

const MovementsGrid: React.FC<MovementsGridProps> = ({ movements }) => {
  const dataGridRef = useRef<DataGrid>(null);

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
        storageKey="stockMovementsGrid"
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
      />
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
