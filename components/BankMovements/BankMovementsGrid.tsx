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
import { Bank, BankMovement } from "./types";
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
import { currencyService } from "@/lib/services/currency";
import {
  DIRECTION_TRANSLATIONS,
  DOCUMENT_TYPE_TRANSLATIONS,
  MOVEMENT_TYPE_TRANSLATIONS,
} from "@/lib/constants/movementEnums";

interface BankMovementsGridProps {
  selectedBank: Bank | null;
  showAllMovements: boolean;
}

const BankMovementsGrid: React.FC<BankMovementsGridProps> = ({
  selectedBank,
  showAllMovements,
}) => {
  const { toast } = useToast();
  const [movements, setMovements] = useState<BankMovement[]>([]);
  const [loading, setLoading] = useState(false); // Changed initial state to false
  const [error, setError] = useState<string | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [targetCurrency, setTargetCurrency] = useState<string>("TRY");
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>(
    {}
  );

  const availableCurrencies = React.useMemo(() => {
    const currencies = new Set<string>();
    movements.forEach((movement) => {
      if (movement.bank?.currency) {
        currencies.add(movement.bank.currency);
      }
    });
    return Array.from(currencies);
  }, [movements]);

  // Reset target currency when switching from all movements to single bank view
  useEffect(() => {
    if (!showAllMovements && selectedBank) {
      setTargetCurrency(selectedBank.currency);
    }
  }, [showAllMovements, selectedBank]);

  // Fetch exchange rates
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const rates = await currencyService.getExchangeRates();
        setExchangeRates({
          USD: rates.USD_TRY,
          EUR: rates.EUR_TRY,
          TRY: 1,
        });
      } catch (error) {
        console.error("Error fetching exchange rates:", error);
      }
    };

    fetchRates();
  }, []);

  const convertAmount = useCallback(
    (amount: string, fromCurrency: string) => {
      if (!amount || !fromCurrency) return 0;
      const numericAmount = parseFloat(amount);

      // If viewing a single bank or currencies match, no conversion needed
      if (!showAllMovements || fromCurrency === targetCurrency) {
        return numericAmount;
      }

      // Convert through TRY as base currency
      const amountInTRY = numericAmount * (exchangeRates[fromCurrency] || 1);
      return amountInTRY / (exchangeRates[targetCurrency] || 1);
    },
    [targetCurrency, exchangeRates, showAllMovements]
  );

  const fetchMovements = useCallback(async () => {
    if (!selectedBank && !showAllMovements) {
      setMovements([]);
      return;
    }

    try {
      setLoading(true);
      const endpoint = selectedBank
        ? `${process.env.BASE_URL}/bankMovements/bank/${selectedBank.id}`
        : `${process.env.BASE_URL}/bankMovements`;

      const response = await fetch(endpoint, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch bank movements");
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
        description: "Failed to fetch bank movements. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedBank, showAllMovements, toast]);

  useEffect(() => {
    fetchMovements();

    const handleRefresh = () => {
      fetchMovements();
    };

    window.addEventListener("refreshBankOperations", handleRefresh);
    return () => {
      window.removeEventListener("refreshBankOperations", handleRefresh);
    };
  }, [fetchMovements]);

  const onExporting = React.useCallback((e: any) => {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Banka Hareketleri");

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
          "BankaHareketleri.xlsx"
        );
      });
    });
  }, []);

  if (!selectedBank && !showAllMovements) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Hareket listesi için bir banka seçin veya tüm hareketleri görüntüleyin
      </div>
    );
  }

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
        scrolling={{ mode: "virtual" }}
      >
        <StateStoring
          enabled={true}
          type="localStorage"
          storageKey="bankMovementsGrid"
        />
        <LoadPanel enabled={true} />
        <Selection mode="multiple" showCheckBoxesMode="always" />
        <FilterRow visible={true} />
        <HeaderFilter visible={true} />
        <SearchPanel visible={true} width={240} placeholder="Ara..." />
        <ColumnChooser enabled={true} mode="select" />
        <Scrolling
          mode="virtual"
          rowRenderingMode="virtual"
          columnRenderingMode="virtual"
        />
        <Export enabled={true} allowExportSelectedData={true} />

        <Column dataField="bank.bankName" caption="Banka Adı" />
        <Column dataField="description" caption="Açıklama" />
        <Column
          dataField="entering"
          caption={showAllMovements ? `Giriş (${targetCurrency})` : "Giriş"}
          dataType="number"
          format="#,##0.00"
          calculateCellValue={(rowData: BankMovement) =>
            convertAmount(
              rowData.entering,
              rowData.bank?.currency || targetCurrency
            )
          }
        />
        <Column
          dataField="emerging"
          caption={showAllMovements ? `Çıkış (${targetCurrency})` : "Çıkış"}
          dataType="number"
          format="#,##0.00"
          calculateCellValue={(rowData: BankMovement) =>
            convertAmount(
              rowData.emerging,
              rowData.bank?.currency || targetCurrency
            )
          }
        />
        <Column dataField="bank.currency" caption="Orijinal Para Birimi" />
        <Column
          dataField="bankDirection"
          caption="Yön"
          calculateCellValue={(rowData: BankMovement) =>
            DIRECTION_TRANSLATIONS[rowData.bankDirection] ||
            rowData.bankDirection
          }
        />

        <Column
          dataField="bankType"
          caption="Tip"
          calculateCellValue={(rowData: BankMovement) =>
            MOVEMENT_TYPE_TRANSLATIONS[
              rowData.bankType as keyof typeof MOVEMENT_TYPE_TRANSLATIONS
            ] || rowData.bankType
          }
        />

        <Column
          dataField="bankDocumentType"
          caption="Belge Tipi"
          calculateCellValue={(rowData: BankMovement) =>
            DOCUMENT_TYPE_TRANSLATIONS[rowData.bankDocumentType] ||
            rowData.bankDocumentType
          }
        />

        <Summary>
          <TotalItem
            column="entering"
            summaryType="sum"
            valueFormat="#,##0.00"
            displayFormat={showAllMovements ? `{0} ${targetCurrency}` : "{0}"}
          />
          <TotalItem
            column="emerging"
            summaryType="sum"
            valueFormat="#,##0.00"
            displayFormat={showAllMovements ? `{0} ${targetCurrency}` : "{0}"}
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

export default BankMovementsGrid;
