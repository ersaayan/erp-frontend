/* eslint-disable @typescript-eslint/no-unused-vars */
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
  Position,
  FilterBuilderPopup,
  FilterPanel,
} from "devextreme-react/data-grid";
import { Workbook } from "exceljs";
import { saveAs } from "file-saver-es";
import { exportDataGrid } from "devextreme/excel_exporter";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { vouchers, voucherTypes, accountTypes, operations } from "./data";

interface VouchersGridProps {
  type: "stock-vouchers" | "pending-transfer" | "incomplete";
}

const searchEditorOptions = { placeholder: "Search column" };

const onExporting = (e: any) => {
  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet("Stok Fişleri");

  exportDataGrid({
    component: e.component,
    worksheet,
    autoFilterEnabled: true,
    customizeCell: ({ gridCell, excelCell }: any) => {
      if (gridCell.rowType === "data") {
        if (typeof gridCell.value === "number") {
          excelCell.numFmt = "#,##0.00";
        } else if (gridCell.value instanceof Date) {
          excelCell.numFmt = "dd.MM.yyyy";
        }
      }
    },
  }).then(() => {
    workbook.xlsx.writeBuffer().then((buffer) => {
      saveAs(
        new Blob([buffer], { type: "application/octet-stream" }),
        "StokFisleri.xlsx"
      );
    });
  });
};

const VouchersGrid: React.FC<VouchersGridProps> = ({ type }) => {
  const dataGridRef = useRef<DataGrid>(null);
  const [filterBuilderPopupPosition, setFilterBuilderPopupPosition] = useState(
    {}
  );

  const clearFilters = () => {
    if (dataGridRef.current) {
      dataGridRef.current.instance.clearFilter();
    }
  };

  const renderToolbarButtons = () => (
    <Item
      location="after"
      render={() => (
        <Button variant="outline" size="sm">
          <RefreshCcw className="h-4 w-4 mr-2" />
          Yenile
        </Button>
      )}
    />
  );

  return (
    <DataGrid
      ref={dataGridRef}
      dataSource={vouchers}
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
        storageKey={`stockVouchersGrid-${type}`}
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

      <Column
        dataField="date"
        caption="Tarih"
        dataType="date"
        format="dd.MM.yyyy"
      />
      <Column dataField="type" caption="Tip">
        <Lookup dataSource={voucherTypes} />
      </Column>
      <Column dataField="documentNo" caption="Evrak No" />
      <Column dataField="accountType" caption="Muh. Durumu">
        <Lookup dataSource={accountTypes} />
      </Column>
      <Column dataField="operation" caption="İşlem">
        <Lookup dataSource={operations} />
      </Column>
      <Column dataField="totalLocation" caption="Toplam Yerel" />
      <Column dataField="totalStock" caption="Toplam Stok" />
      <Column dataField="description" caption="Açıklama" />
      <Column dataField="warehouses" caption="Depolar" />
      <Column dataField="reference" caption="Referans" />
      <Column dataField="user" caption="Kullanıcı Adı" />

      <Summary>
        <TotalItem column="totalStock" summaryType="sum" />
        <TotalItem
          column="totalLocation"
          summaryType="sum"
          valueFormat="#,##0.00"
        />
      </Summary>

      <Toolbar>
        <Item name="groupPanel" location="before" />
        {renderToolbarButtons()}
        <Item name="searchPanel" location="after" />
        <Item name="exportButton" location="after" />
        <Item name="columnChooserButton" location="after" />
      </Toolbar>
    </DataGrid>
  );
};

export default VouchersGrid;
