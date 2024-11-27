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
import { useToast } from "@/hooks/use-toast";
import { Bank } from "./types";
import { Workbook } from "exceljs";
import { saveAs } from "file-saver-es";
import { exportDataGrid } from "devextreme/excel_exporter";

interface BanksGridProps {
  onBankSelect: (bank: Bank) => void;
}

const BanksGrid: React.FC<BanksGridProps> = ({ onBankSelect }) => {
  const { toast } = useToast();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  const fetchBanks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:1303/banks");
      if (!response.ok) {
        throw new Error("Failed to fetch banks");
      }
      const data = await response.json();
      setBanks(data);
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
        description: "Failed to fetch banks. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchBanks();

    const handleRefresh = () => {
      fetchBanks();
    };

    window.addEventListener("refreshBankOperations", handleRefresh);
    return () => {
      window.removeEventListener("refreshBankOperations", handleRefresh);
    };
  }, [fetchBanks]);

  const handleRowClick = (e: any) => {
    onBankSelect(e.data);
  };

  const onExporting = React.useCallback((e: any) => {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Bankalar");

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
          }
        }
      },
    }).then(() => {
      workbook.xlsx.writeBuffer().then((buffer) => {
        saveAs(
          new Blob([buffer], { type: "application/octet-stream" }),
          "Bankalar.xlsx"
        );
      });
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading banks...</span>
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
      dataSource={banks}
      showBorders={true}
      showRowLines={true}
      showColumnLines={true}
      rowAlternationEnabled={true}
      columnAutoWidth={true}
      columnMinWidth={100}
      wordWrapEnabled={true}
      height="calc(100% - 2rem)"
      onRowClick={handleRowClick}
      onExporting={onExporting}
      selectedRowKeys={selectedRowKeys}
      onSelectionChanged={(e) => setSelectedRowKeys(e.selectedRowKeys)}
    >
      <StateStoring enabled={true} type="localStorage" storageKey="banksGrid" />
      <LoadPanel enabled={true} />
      <Selection mode="multiple" showCheckBoxesMode="always" />
      <FilterRow visible={true} />
      <HeaderFilter visible={true} />
      <SearchPanel visible={true} width={240} placeholder="Ara..." />
      <ColumnChooser enabled={true} mode="select" />
      <Scrolling mode="virtual" />
      <Export enabled={true} allowExportSelectedData={true} />

      <Column dataField="bankName" caption="Banka Adı" />
      <Column dataField="branchCode" caption="Şube Kodu" />
      <Column
        dataField="balance"
        caption="Bakiye"
        dataType="number"
        format="#,##0.00"
        calculateCellValue={(rowData: Bank) => parseFloat(rowData.balance)}
      />
      <Column dataField="currency" caption="Para Birimi" width={100} />

      <Summary>
        <TotalItem column="balance" summaryType="sum" valueFormat="#,##0.00" />
      </Summary>

      <Toolbar>
        <Item name="searchPanel" location="before" />
        <Item name="exportButton" location="after" />
        <Item name="columnChooserButton" location="after" />
      </Toolbar>
    </DataGrid>
  );
};

export default BanksGrid;
