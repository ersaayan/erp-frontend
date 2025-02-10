import { useState, useCallback } from "react";
import {
  DataGrid,
  Column,
  Toolbar,
  Item,
  Grouping,
  GroupPanel,
  SearchPanel,
  HeaderFilter,
  FilterRow,
  Export,
  ColumnChooser,
  Paging,
  Pager,
  Summary,
  TotalItem,
} from "devextreme-react/data-grid";
import { DateBox } from "devextreme-react/date-box";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Check,
  ChevronsUpDown,
  Loader2,
  Calendar,
  Search,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { useStockSearch } from "@/hooks/useStockSearch";
import type { StockBalanceReportParams, StockBalanceReportItem } from "./types";
import { cn } from "@/lib/utils";
import { Workbook } from "exceljs";
import { saveAs } from "file-saver-es";
import { exportDataGrid } from "devextreme/excel_exporter";

export default function StockBalanceReport() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<StockBalanceReportItem[]>([]);
  const [filters, setFilters] = useState<StockBalanceReportParams>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [showCriticalOnly, setShowCriticalOnly] = useState(false);
  const { toast } = useToast();
  const {
    results,
    loading: isLoading,
    searchStocks: searchStock,
  } = useStockSearch();

  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/stockcards/balance-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filters),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Bir hata oluştu");
      }

      const result = await response.json();
      setData(result);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error instanceof Error ? error.message : "Bir hata oluştu",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (
    field: keyof StockBalanceReportParams,
    value: any
  ) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDateChange = (
    field: "startDate" | "endDate",
    value: Date | null
  ) => {
    if (value) {
      handleFilterChange(field, format(value, "yyyy-MM-dd"));
    } else {
      const newFilters = { ...filters };
      delete newFilters[field];
      setFilters(newFilters);
    }
  };

  const handleReset = () => {
    setFilters({});
    setData([]);
    setSearchQuery("");
  };

  const handleStockSelect = (productCode: string) => {
    const selectedStock = results.find(
      (stock) => stock.productCode === productCode
    );
    if (selectedStock) {
      handleFilterChange("productCode", selectedStock.productCode);
      setSearchQuery(`${selectedStock.productCode}`);
      setOpen(false);
    }
  };

  const getFilteredData = () => {
    if (!showCriticalOnly) return data;
    return data.filter((item) => item.currentStock <= item.criticalStock);
  };

  const onExporting = useCallback((e: any) => {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Stok Bakiye Raporu");

    exportDataGrid({
      component: e.component,
      worksheet,
      autoFilterEnabled: true,
      customizeCell: ({ gridCell, excelCell }: any) => {
        if (gridCell?.column?.dataField === "warehouseName") {
          excelCell.font = { ...excelCell.font, bold: true };
        }
        if (gridCell?.column?.dataField === "inQuantity") {
          excelCell.font = { ...excelCell.font, color: { argb: "FF008000" } };
        }
        if (gridCell?.column?.dataField === "outQuantity") {
          excelCell.font = { ...excelCell.font, color: { argb: "FFFF0000" } };
        }
        if (
          gridCell?.column?.dataField === "currentStock" &&
          gridCell.data?.currentStock <= gridCell.data?.criticalStock
        ) {
          excelCell.font = { ...excelCell.font, color: { argb: "FFFF0000" } };
        }
        if (
          gridCell?.column?.dataField === "criticalStock" &&
          gridCell.data?.currentStock <= gridCell.data?.criticalStock
        ) {
          excelCell.font = { ...excelCell.font, color: { argb: "FFFF0000" } };
        }
      },
    }).then(() => {
      workbook.xlsx.writeBuffer().then((buffer) => {
        const date = new Date();
        const fileName = `stok_bakiye_raporu_${format(
          date,
          "dd_MM_yyyy_HH_mm"
        )}.xlsx`;
        saveAs(
          new Blob([buffer], { type: "application/octet-stream" }),
          fileName
        );
      });
    });
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Search className="h-5 w-5" />
              Stok Bakiye Raporu
            </CardTitle>
            <Button
              variant={showCriticalOnly ? "destructive" : "outline"}
              onClick={() => setShowCriticalOnly(!showCriticalOnly)}
              className="flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              {showCriticalOnly
                ? "Tüm Stokları Göster"
                : "Kritik Stokları Göster"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            {/* Filtreler */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Search className="h-4 w-4" />
                  Stok Kodu
                </label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between hover:bg-background"
                    >
                      {searchQuery || "Stok ara..."}
                      {isLoading ? (
                        <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin opacity-50" />
                      ) : (
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-2" align="start">
                    <div className="flex flex-col gap-2">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Stok kodu veya adı ile ara..."
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            searchStock(e.target.value);
                          }}
                          className="pl-8 h-9"
                        />
                      </div>
                      {isLoading ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="ml-2 text-sm">Aranıyor...</span>
                        </div>
                      ) : results.length === 0 ? (
                        <div className="text-sm text-center py-6 text-muted-foreground">
                          Sonuç bulunamadı.
                        </div>
                      ) : (
                        <ScrollArea className="h-[300px]">
                          <div className="flex flex-col gap-1">
                            {results.map((stock) => (
                              <Button
                                key={stock.productCode}
                                variant="ghost"
                                className="flex items-start justify-between px-2 py-1.5 h-auto hover:bg-accent"
                                onClick={() => {
                                  handleStockSelect(stock.productCode);
                                }}
                              >
                                <div className="flex flex-col items-start">
                                  <span className="font-medium">
                                    {stock.productCode}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {stock.productName}
                                  </span>
                                </div>
                                {filters.productCode === stock.productCode && (
                                  <Check className="h-4 w-4 text-primary shrink-0" />
                                )}
                              </Button>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Başlangıç Tarihi
                </label>
                <DateBox
                  value={filters.startDate ? new Date(filters.startDate) : null}
                  onValueChanged={(e) => handleDateChange("startDate", e.value)}
                  displayFormat="dd.MM.yyyy"
                  dateSerializationFormat="yyyy-MM-dd"
                  type="date"
                  className="rounded-md border"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Bitiş Tarihi
                </label>
                <DateBox
                  value={filters.endDate ? new Date(filters.endDate) : null}
                  onValueChanged={(e) => handleDateChange("endDate", e.value)}
                  displayFormat="dd.MM.yyyy"
                  dateSerializationFormat="yyyy-MM-dd"
                  type="date"
                  className="rounded-md border"
                />
              </div>

              <div className="flex flex-col justify-end">
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    onClick={handleSearch}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Yükleniyor
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Ara
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={loading}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Sonuçlar */}
            <div className="rounded-md border">
              <DataGrid
                dataSource={getFilteredData()}
                showBorders={true}
                columnAutoWidth={true}
                wordWrapEnabled={true}
                showColumnLines={true}
                showRowLines={true}
                rowAlternationEnabled={true}
                allowColumnReordering={true}
                allowColumnResizing={true}
                height="calc(100vh - 400px)"
                className="rounded-md"
                onExporting={onExporting}
                onRowPrepared={(e) => {
                  if (e.data && e.data.currentStock <= e.data.criticalStock) {
                    e.rowElement.style.backgroundColor =
                      "rgba(239, 68, 68, 0.1)";
                  }
                }}
              >
                <GroupPanel visible={true} />
                <SearchPanel
                  visible={true}
                  width={240}
                  placeholder="Tabloda ara..."
                />
                <HeaderFilter visible={true} />
                <FilterRow visible={true} />
                <Grouping autoExpandAll={false} />
                <Export
                  enabled={true}
                  allowExportSelectedData={true}
                  texts={{
                    exportAll: "Tüm Verileri Excel'e Aktar",
                    exportSelectedRows: "Seçili Satırları Excel'e Aktar",
                    exportTo: "Excel'e Aktar",
                  }}
                />
                <ColumnChooser enabled={true} mode="select" />
                <Paging defaultPageSize={20} />
                <Pager
                  showPageSizeSelector={true}
                  allowedPageSizes={[10, 20, 50, 100]}
                  showInfo={true}
                  showNavigationButtons={true}
                />

                <Column
                  dataField="productCode"
                  caption="Stok Kodu"
                  alignment="left"
                  allowGrouping={true}
                  allowSorting={true}
                  allowFiltering={true}
                  cellRender={(cell) => (
                    <div className="font-medium">{cell.value}</div>
                  )}
                />
                <Column
                  dataField="productName"
                  caption="Stok Adı"
                  alignment="left"
                  allowGrouping={true}
                  allowSorting={true}
                  allowFiltering={true}
                />
                <Column
                  dataField="warehouseName"
                  caption="Depo"
                  alignment="left"
                  allowGrouping={true}
                  allowSorting={true}
                  allowFiltering={true}
                  cellRender={(cell) => (
                    <Badge variant="outline">{cell.value}</Badge>
                  )}
                />
                <Column
                  dataField="inQuantity"
                  caption="Giriş Miktarı"
                  alignment="right"
                  allowGrouping={true}
                  allowSorting={true}
                  allowFiltering={true}
                  format={{ type: "fixedPoint", precision: 2 }}
                  cellRender={(cell) => (
                    <div className="text-green-600 font-medium">
                      {cell.value != null
                        ? cell.value.toLocaleString("tr-TR", {
                            minimumFractionDigits: 2,
                          })
                        : "0,00"}
                    </div>
                  )}
                />
                <Column
                  dataField="outQuantity"
                  caption="Çıkış Miktarı"
                  alignment="right"
                  allowGrouping={true}
                  allowSorting={true}
                  allowFiltering={true}
                  format={{ type: "fixedPoint", precision: 2 }}
                  cellRender={(cell) => (
                    <div className="text-red-600 font-medium">
                      {cell.value != null
                        ? cell.value.toLocaleString("tr-TR", {
                            minimumFractionDigits: 2,
                          })
                        : "0,00"}
                    </div>
                  )}
                />
                <Column
                  dataField="currentStock"
                  caption="Mevcut Stok"
                  alignment="right"
                  allowGrouping={true}
                  allowSorting={true}
                  allowFiltering={true}
                  format={{ type: "fixedPoint", precision: 2 }}
                  cellRender={(cell) => {
                    const isCritical =
                      cell.data.currentStock != null &&
                      cell.data.criticalStock != null &&
                      cell.data.currentStock <= cell.data.criticalStock;
                    return (
                      <div
                        className={cn(
                          "font-medium",
                          isCritical ? "text-red-600" : ""
                        )}
                      >
                        {cell.value != null
                          ? cell.value.toLocaleString("tr-TR", {
                              minimumFractionDigits: 2,
                            })
                          : "0,00"}
                        {isCritical && (
                          <AlertTriangle className="inline-block ml-1 h-4 w-4 text-red-600" />
                        )}
                      </div>
                    );
                  }}
                />
                <Column
                  dataField="criticalStock"
                  caption="Kritik Stok"
                  alignment="right"
                  allowGrouping={true}
                  allowSorting={true}
                  allowFiltering={true}
                  format={{ type: "fixedPoint", precision: 2 }}
                  cellRender={(cell) => {
                    const isCritical =
                      cell.data.currentStock != null &&
                      cell.data.criticalStock != null &&
                      cell.data.currentStock <= cell.data.criticalStock;
                    return (
                      <div
                        className={cn(
                          "font-medium",
                          isCritical ? "text-red-600" : "text-orange-600"
                        )}
                      >
                        {cell.value != null
                          ? cell.value.toLocaleString("tr-TR", {
                              minimumFractionDigits: 2,
                            })
                          : "0,00"}
                      </div>
                    );
                  }}
                />

                <Summary>
                  <TotalItem
                    column="inQuantity"
                    summaryType="sum"
                    valueFormat={{ type: "fixedPoint", precision: 2 }}
                    displayFormat="{0}"
                    cssClass="text-green-600 font-medium"
                  />
                  <TotalItem
                    column="outQuantity"
                    summaryType="sum"
                    valueFormat={{ type: "fixedPoint", precision: 2 }}
                    displayFormat="{0}"
                    cssClass="text-red-600 font-medium"
                  />
                  <TotalItem
                    column="currentStock"
                    summaryType="sum"
                    valueFormat={{ type: "fixedPoint", precision: 2 }}
                    displayFormat="{0}"
                    cssClass="font-medium"
                  />
                </Summary>

                <Toolbar>
                  <Item location="before" name="groupPanel" />
                  <Item location="after" name="searchPanel" />
                  <Item location="after" name="exportButton" />
                  <Item location="after" name="columnChooserButton" />
                </Toolbar>
              </DataGrid>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
