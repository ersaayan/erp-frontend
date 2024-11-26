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
import { Vault, VaultMovement } from "./types";
import { Workbook } from "exceljs";
import { saveAs } from "file-saver-es";
import { exportDataGrid } from "devextreme/excel_exporter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VaultMovementsGridProps {
  selectedVault: Vault | null;
  showAllMovements: boolean;
}

const VaultMovementsGrid: React.FC<VaultMovementsGridProps> = ({
  selectedVault,
  showAllMovements,
}) => {
  const { toast } = useToast();
  const [movements, setMovements] = useState<VaultMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [targetCurrency, setTargetCurrency] = useState<string>("TRY");
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>(
    {
      USD: 31.5,
      EUR: 33.5,
      TRY: 1,
    }
  );

  const availableCurrencies = React.useMemo(() => {
    const currencies = new Set<string>();
    movements.forEach((movement) => {
      if (movement.vault?.currency) {
        currencies.add(movement.vault.currency);
      }
    });
    return Array.from(currencies);
  }, [movements]);

  const convertAmount = useCallback(
    (amount: string, fromCurrency: string) => {
      if (!amount || !fromCurrency) return 0;
      const numericAmount = parseFloat(amount);
      if (fromCurrency === targetCurrency) return numericAmount;

      const rate = exchangeRates[fromCurrency] / exchangeRates[targetCurrency];
      return numericAmount * rate;
    },
    [targetCurrency, exchangeRates]
  );

  const fetchMovements = useCallback(async () => {
    if (!selectedVault && !showAllMovements) {
      setMovements([]);
      return;
    }

    try {
      setLoading(true);
      const endpoint = selectedVault
        ? `http://localhost:1303/vaultMovements/vault/${selectedVault.id}`
        : "http://localhost:1303/vaultMovements";

      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error("Failed to fetch vault movements");
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
        description: "Failed to fetch vault movements. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedVault, showAllMovements, toast]);

  useEffect(() => {
    fetchMovements();

    const handleRefresh = () => {
      fetchMovements();
    };

    window.addEventListener("refreshVaultOperations", handleRefresh);
    return () => {
      window.removeEventListener("refreshVaultOperations", handleRefresh);
    };
  }, [fetchMovements]);

  const onExporting = React.useCallback((e: any) => {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Kasa Hareketleri");

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
          "KasaHareketleri.xlsx"
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

  if (!selectedVault && !showAllMovements) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Hareket listesi için bir kasa seçin veya tüm hareketleri görüntüleyin
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showAllMovements && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Para Birimi:</span>
          <Select value={targetCurrency} onValueChange={setTargetCurrency}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Para birimi seçin" />
            </SelectTrigger>
            <SelectContent>
              {availableCurrencies.map((currency) => (
                <SelectItem key={currency} value={currency}>
                  {currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <DataGrid
        dataSource={movements}
        showBorders={true}
        showRowLines={true}
        showColumnLines={true}
        rowAlternationEnabled={true}
        columnAutoWidth={true}
        wordWrapEnabled={true}
        height="calc(100% - 3rem)"
        onExporting={onExporting}
        selectedRowKeys={selectedRowKeys}
        onSelectionChanged={(e) => setSelectedRowKeys(e.selectedRowKeys)}
      >
        <StateStoring
          enabled={true}
          type="localStorage"
          storageKey="vaultMovementsGrid"
        />
        <LoadPanel enabled={true} />
        <Selection mode="multiple" showCheckBoxesMode="always" />
        <FilterRow visible={true} />
        <HeaderFilter visible={true} />
        <SearchPanel visible={true} width={240} placeholder="Ara..." />
        <ColumnChooser enabled={true} mode="select" />
        <Scrolling mode="virtual" />
        <Export enabled={true} allowExportSelectedData={true} />

        <Column dataField="vault.vaultName" caption="Kasa Adı" />
        <Column dataField="description" caption="Açıklama" />
        <Column
          dataField="entering"
          caption={`Giriş (${targetCurrency})`}
          dataType="number"
          format="#,##0.00"
          calculateCellValue={(rowData: VaultMovement) =>
            convertAmount(
              rowData.entering,
              rowData.vault?.currency || targetCurrency
            )
          }
        />
        <Column
          dataField="emerging"
          caption={`Çıkış (${targetCurrency})`}
          dataType="number"
          format="#,##0.00"
          calculateCellValue={(rowData: VaultMovement) =>
            convertAmount(
              rowData.emerging,
              rowData.vault?.currency || targetCurrency
            )
          }
        />
        <Column dataField="vault.currency" caption="Orijinal Para Birimi" />
        <Column dataField="vaultDirection" caption="Yön" />
        <Column dataField="vaultType" caption="Tip" />
        <Column dataField="vaultDocumentType" caption="Belge Tipi" />

        <Summary>
          <TotalItem
            column="entering"
            summaryType="sum"
            valueFormat="#,##0.00"
            displayFormat={`{0} ${targetCurrency}`}
          />
          <TotalItem
            column="emerging"
            summaryType="sum"
            valueFormat="#,##0.00"
            displayFormat={`{0} ${targetCurrency}`}
          />
        </Summary>

        <Toolbar>
          <Item name="searchPanel" />
          <Item name="exportButton" />
          <Item name="columnChooserButton" />
        </Toolbar>
      </DataGrid>
    </div>
  );
};

export default VaultMovementsGrid;
