"use client";

import React, { useCallback, useEffect, useState } from "react";
import DataGrid, {
  Column,
  Selection,
  FilterRow,
  HeaderFilter,
  Scrolling,
  LoadPanel,
  StateStoring,
  Summary,
  TotalItem,
  Export,
  Toolbar,
  Item,
  SearchPanel,
  ColumnChooser,
} from "devextreme-react/data-grid";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { Current } from "./types";
import { useToast } from "@/hooks/use-toast";
import { Workbook } from "exceljs";
import { saveAs } from "file-saver-es";
import { exportDataGrid } from "devextreme/excel_exporter";

interface CurrentsGridProps {
  onCurrentSelect: (current: Current) => void;
}

const CurrentsGrid: React.FC<CurrentsGridProps> = ({ onCurrentSelect }) => {
  const { toast } = useToast();
  const [currents, setCurrents] = useState<Current[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  const fetchCurrents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.BASE_URL}/currents`);
      if (!response.ok) {
        throw new Error("Failed to fetch currents");
      }
      const data = await response.json();
      setCurrents(data);
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
        description: "Failed to fetch currents. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCurrents();

    const handleRefresh = () => {
      fetchCurrents();
    };

    window.addEventListener("refreshCurrents", handleRefresh);
    return () => {
      window.removeEventListener("refreshCurrents", handleRefresh);
    };
  }, [fetchCurrents]);

  const handleRowClick = (e: any) => {
    onCurrentSelect(e.data);
  };

  const onExporting = useCallback((e: any) => {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Cariler");

    const selectedData = e.component.getSelectedRowsData();

    exportDataGrid({
      component: e.component,
      worksheet,
      selectedRowsOnly: selectedData.length > 0,
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
          "Cariler.xlsx"
        );
      });
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading currents...</span>
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
      dataSource={currents}
      showBorders={true}
      showRowLines={true}
      showColumnLines={true}
      rowAlternationEnabled={true}
      columnAutoWidth={true}
      wordWrapEnabled={true}
      height="calc(100vh - 250px)"
      onRowClick={handleRowClick}
      selectedRowKeys={selectedRowKeys}
      onSelectionChanged={(e) => setSelectedRowKeys(e.selectedRowKeys)}
      onExporting={onExporting}
    >
      <StateStoring
        enabled={true}
        type="localStorage"
        storageKey="currentsGrid"
      />
      <LoadPanel enabled={true} />
      <Selection mode="multiple" showCheckBoxesMode="always" />
      <FilterRow visible={true} />
      <HeaderFilter visible={true} />
      <SearchPanel visible={true} width={240} placeholder="Ara..." />
      <ColumnChooser enabled={true} mode="select" />
      <Scrolling mode="virtual" />
      <Export enabled={true} allowExportSelectedData={true} />

      <Column dataField="currentCode" caption="Cari Kodu" />
      <Column dataField="currentName" caption="Cari Adı" />
      <Column dataField="currentType" caption="Cari Tipi" />
      <Column dataField="institution" caption="Kurum Tipi" />
      <Column dataField="taxNumber" caption="Vergi No" />
      <Column dataField="taxOffice" caption="Vergi Dairesi" />
      <Column dataField="title" caption="Ünvan" />
      <Column dataField="webSite" caption="Web Site" />

      <Summary>
        <TotalItem
          column="debtAmount"
          summaryType="sum"
          valueFormat="#,##0.00"
        />
        <TotalItem
          column="creditAmount"
          summaryType="sum"
          valueFormat="#,##0.00"
        />
      </Summary>

      <Toolbar>
        <Item name="searchPanel" />
        <Item name="exportButton" />
        <Item name="columnChooserButton" />
      </Toolbar>
    </DataGrid>
  );
};

export default CurrentsGrid;
