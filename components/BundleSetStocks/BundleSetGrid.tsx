"use client";

import React, { useRef, useState } from "react";
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
  ColumnChooserSearch,
  ColumnChooserSelection,
  FilterBuilderPopup,
  FilterPanel,
  Position,
} from "devextreme-react/data-grid";
import { Workbook } from "exceljs";
import { saveAs } from "file-saver-es";
import { exportDataGrid } from "devextreme/excel_exporter";
import { bundleSetStocks, currencies } from "./data";

const searchEditorOptions = { placeholder: "Search column" };

const onExporting = (e: any) => {
  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet("Gruplu Stoklar");

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
        "GrupluStoklar.xlsx"
      );
    });
  });
};

const BundleSetGrid: React.FC = () => {
  const dataGridRef = useRef<DataGrid>(null);
  const [filterBuilderPopupPosition] = useState({});

  return (
    <DataGrid
      ref={dataGridRef}
      dataSource={bundleSetStocks}
      showBorders={true}
      showRowLines={true}
      showColumnLines={true}
      rowAlternationEnabled={true}
      allowColumnReordering={true}
      allowColumnResizing={true}
      columnResizingMode="widget"
      columnAutoWidth={true}
      columnHidingEnabled={true}
      remoteOperations={true}
      wordWrapEnabled={true}
      height="calc(100vh - 250px)"
      onExporting={onExporting}
      columnWidth={150}
    >
      <StateStoring
        enabled={true}
        type="localStorage"
        storageKey="bundleSetStocksGrid"
      />
      <LoadPanel enabled={true} />
      <Selection mode="multiple" showCheckBoxesMode="always" />
      <FilterRow visible={true} />
      <HeaderFilter visible={true} />
      <GroupPanel visible={true} />
      <Grouping autoExpandAll={false} />
      <ColumnChooser height={340} enabled={true} mode="select">
        <Position
          my="right top"
          at="right bottom"
          of=".dx-datagrid-column-chooser-button"
        />
        <ColumnChooserSearch
          enabled={true}
          editorOptions={searchEditorOptions}
        />
        <ColumnChooserSelection
          allowSelectAll={true}
          selectByClick={true}
          recursive={true}
        />
      </ColumnChooser>
      <ColumnFixing enabled={true} />
      <FilterPanel visible={true} />
      <FilterBuilderPopup position={filterBuilderPopupPosition} />
      <Scrolling mode="virtual" rowRenderingMode="virtual" />
      <Paging enabled={false} />
      <SearchPanel visible={true} width={240} placeholder="Ara..." />
      <Export
        enabled={true}
        allowExportSelectedData={true}
        texts={{
          exportAll: "Tüm Verileri Excel'e Aktar",
          exportSelectedRows: "Seçili Satırları Excel'e Aktar",
          exportTo: "Excel'e Aktar",
        }}
      />

      <Column dataField="code" caption="Kod" />
      <Column dataField="barcode" caption="Barkod" />
      <Column dataField="stockName" caption="Stok Adı" />
      <Column dataField="images" caption="Resimler" />
      <Column dataField="salePrice" caption="Satış Fiyat" format="#,##0.00" />
      <Column
        dataField="remainingQuantity"
        caption="Kalan Miktar"
        format="#,##0"
      />
      <Column dataField="properties" caption="Özellikler" />
      <Column dataField="categories" caption="Kategoriler" />
      <Column dataField="unit" caption="Birim" />
      <Column dataField="currency" caption="Döviz">
        <Lookup dataSource={currencies} />
      </Column>
      <Column dataField="model" caption="Model" />
      <Column dataField="brand" caption="Marka" />
      <Column dataField="shortDescription" caption="Kısa Açıklama" />
      <Column dataField="longDescription" caption="Uzun Açıklama" />

      <Summary>
        <TotalItem
          column="remainingQuantity"
          summaryType="sum"
          valueFormat="#,##0"
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

export default BundleSetGrid;
