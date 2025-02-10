"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import DataGrid, {
  Column,
  FilterRow,
  HeaderFilter,
  Scrolling,
  LoadPanel,
  StateStoring,
  Export,
  Toolbar,
  Item,
  SearchPanel,
  ColumnChooser,
  Summary,
  TotalItem,
} from "devextreme-react/data-grid";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle, RefreshCw, FilterX } from "lucide-react";
import { Workbook } from "exceljs";
import { saveAs } from "file-saver-es";
import { exportDataGrid } from "devextreme/excel_exporter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  StockTurnoverReport,
  StockTurnoverReportParams,
  StockTurnoverReportResponse,
} from "./types";

const StockTurnoverReportComponent: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<StockTurnoverReport[]>([]);

  const dataGridRef = React.useRef<any>(null);

  const fetchReport = useCallback(
    async (params?: StockTurnoverReportParams) => {
      try {
        setLoading(true);
        setError(null);

        // URL'yi ve parametreleri oluştur
        let url = `${process.env.BASE_URL}/stockcards/turnover-report`;
        if (params) {
          const queryParams = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
              if (value instanceof Date) {
                queryParams.append(key, value.toISOString());
              } else {
                queryParams.append(key, String(value));
              }
            }
          });
          const queryString = queryParams.toString();
          if (queryString) {
            url += `?${queryString}`;
          }
        }

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Rapor yüklenirken bir hata oluştu");
        }

        const result: StockTurnoverReportResponse = await response.json();
        setReportData(result.data);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Rapor yüklenirken beklenmeyen bir hata oluştu";
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Hata",
          description: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const onExporting = useCallback((e: any) => {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Stok Devir Raporu");

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
          "StokDevirRaporu.xlsx"
        );
      });
    });
  }, []);

  const clearFilters = useCallback(() => {
    if (dataGridRef.current) {
      const instance = dataGridRef.current.instance;
      instance.clearFilter();
      instance.clearSorting();
      instance.clearGrouping();
      instance.searchByText("");
      toast({
        title: "Başarılı",
        description: "Tüm filtreler temizlendi",
      });
    }
  }, [toast]);

  if (loading && reportData.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Stok Devir Raporu</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <FilterX className="h-4 w-4 mr-2" />
            Filtreleri Temizle
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchReport()}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="flex-1">
        <DataGrid
          ref={dataGridRef}
          dataSource={reportData}
          showBorders={true}
          showRowLines={true}
          showColumnLines={true}
          rowAlternationEnabled={true}
          columnAutoWidth={true}
          wordWrapEnabled={true}
          height="calc(100vh - 12rem)"
          onExporting={onExporting}
          selection={{ mode: "multiple" }}
        >
          <StateStoring
            enabled={true}
            type="localStorage"
            storageKey="stockTurnoverReportGrid"
          />
          <LoadPanel enabled={true} />
          <FilterRow visible={true} />
          <HeaderFilter visible={true} />
          <SearchPanel visible={true} width={240} placeholder="Ara..." />
          <ColumnChooser enabled={true} mode="select" />
          <Scrolling mode="virtual" />
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
            dataField="productCode"
            caption="Stok Kodu"
            allowHeaderFiltering={true}
          />
          <Column
            dataField="productName"
            caption="Stok Adı"
            allowHeaderFiltering={true}
          />
          <Column
            dataField="currentStock"
            caption="Mevcut Stok"
            dataType="number"
            format="#,##0"
            allowHeaderFiltering={true}
          />
          <Column
            dataField="last90DaysOutQuantity"
            caption="Son 90 Gün Çıkış"
            dataType="number"
            format="#,##0"
          />
          <Column
            dataField="last30DaysOutQuantity"
            caption="Son 30 Gün Çıkış"
            dataType="number"
            format="#,##0"
          />
          <Column
            dataField="last7DaysOutQuantity"
            caption="Son 7 Gün Çıkış"
            dataType="number"
            format="#,##0"
          />
          <Column
            dataField="averageDailyOutQuantity"
            caption="Günlük Ort. Çıkış"
            dataType="number"
            format="#,##0.00"
          />
          <Column
            dataField="turnoverRate"
            caption="Devir Hızı"
            dataType="number"
            format="#,##0.00%"
          />
          <Column
            dataField="isBelowCriticalLevel"
            caption="Kritik Seviye"
            dataType="boolean"
            trueText="Evet"
            falseText="Hayır"
          />
          <Column
            dataField="criticalLevel"
            caption="Kritik Seviye Miktarı"
            dataType="number"
            format="#,##0"
          />
          <Column
            dataField="movementAnalysis.trend"
            caption="Hareket Trendi"
            calculateCellValue={(rowData: StockTurnoverReport) =>
              rowData.movementAnalysis.trend === "active" ? "Aktif" : "Pasif"
            }
          />
          <Column
            dataField="movementAnalysis.velocityChange"
            caption="Hız Değişimi"
            dataType="number"
            format="#,##0.00%"
          />
          <Column
            dataField="movementAnalysis.stockSufficiency"
            caption="Stok Yeterlilik (Gün)"
            dataType="number"
            format="#,##0"
          />
          <Column
            dataField="periodComparison.changePercentage"
            caption="Dönemsel Değişim"
            dataType="number"
            format="#,##0.00%"
          />

          <Summary>
            <TotalItem
              column="currentStock"
              summaryType="sum"
              valueFormat="#,##0"
            />
            <TotalItem
              column="last30DaysOutQuantity"
              summaryType="sum"
              valueFormat="#,##0"
            />
            <TotalItem
              column="last7DaysOutQuantity"
              summaryType="sum"
              valueFormat="#,##0"
            />
          </Summary>

          <Toolbar>
            <Item name="searchPanel" />
            <Item name="exportButton" />
            <Item name="columnChooserButton" />
          </Toolbar>
        </DataGrid>
      </Card>
    </div>
  );
};

export default StockTurnoverReportComponent;
