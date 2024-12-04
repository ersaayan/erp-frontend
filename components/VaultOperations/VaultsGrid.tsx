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
import { AlertCircle, Loader2, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Vault } from "./types";
import { Workbook } from "exceljs";
import { saveAs } from "file-saver-es";
import { exportDataGrid } from "devextreme/excel_exporter";
import { useVaultDialog } from "./VaultDialog/useVaultDialog";
import { Button } from "../ui/button";

interface VaultsGridProps {
  onVaultSelect: (vault: Vault) => void;
}

const VaultsGrid: React.FC<VaultsGridProps> = ({ onVaultSelect }) => {
  const { toast } = useToast();
  const { openDialog } = useVaultDialog();
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  const fetchVaults = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.BASE_URL}/vaults`);
      if (!response.ok) {
        throw new Error("Failed to fetch vaults");
      }
      const data = await response.json();
      setVaults(data);
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
        description: "Failed to fetch vaults. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchVaults();

    const handleRefresh = () => {
      fetchVaults();
    };

    window.addEventListener("refreshVaultOperations", handleRefresh);
    return () => {
      window.removeEventListener("refreshVaultOperations", handleRefresh);
    };
  }, [fetchVaults]);

  const handleRowClick = (e: any) => {
    onVaultSelect(e.data);
  };

  const onExporting = React.useCallback((e: any) => {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Kasalar");

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
          "Kasalar.xlsx"
        );
      });
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading vaults...</span>
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
      dataSource={vaults}
      showBorders={true}
      showRowLines={true}
      showColumnLines={true}
      rowAlternationEnabled={true}
      columnAutoWidth={false}
      columnMinWidth={50}
      wordWrapEnabled={true}
      height="calc(100% - 2rem)"
      onRowClick={handleRowClick}
      onExporting={onExporting}
      selectedRowKeys={selectedRowKeys}
      onSelectionChanged={(e) => setSelectedRowKeys(e.selectedRowKeys)}
    >
      <StateStoring
        enabled={true}
        type="localStorage"
        storageKey="vaultsGrid"
      />
      <LoadPanel enabled={true} />
      <Selection mode="multiple" showCheckBoxesMode="always" />
      <FilterRow visible={true} />
      <HeaderFilter visible={true} />
      <SearchPanel visible={true} width={240} placeholder="Ara..." />
      <ColumnChooser enabled={true} mode="select" />
      <Scrolling mode="virtual" />
      <Export enabled={true} allowExportSelectedData={true} />

      <Column dataField="vaultName" caption="Kasa Adı" />
      <Column dataField="branchCode" caption="Şube Kodu" />
      <Column
        dataField="balance"
        caption="Bakiye"
        dataType="number"
        format="#,##0.00"
        calculateCellValue={(rowData: Vault) => parseFloat(rowData.balance)}
      />
      <Column dataField="currency" caption="Para Birimi" width={100} />
      <Column
        width={70}
        caption="İşlemler"
        cellRender={(cellData: any) => (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={(e) => {
              e.stopPropagation();
              openDialog(cellData.data);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      />

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

export default VaultsGrid;
