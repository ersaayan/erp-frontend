"use client";

import React, { useRef, useState, useCallback } from "react";
import DataGrid, {
  Column,
  Export,
  Selection,
  FilterRow,
  HeaderFilter,
  FilterPanel,
  FilterBuilderPopup,
  Scrolling,
  GroupPanel,
  Grouping,
  Summary,
  TotalItem,
  ColumnChooser,
  Toolbar,
  Item,
  Paging,
  StateStoring,
} from "devextreme-react/data-grid";
import { Workbook } from "exceljs";
import { saveAs } from "file-saver-es";
import { exportDataGrid } from "devextreme/excel_exporter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  CheckSquare,
  Filter,
  Loader2,
  RefreshCw,
  Settings,
  Upload,
} from "lucide-react";
import { StockCard } from "./types";
import { currencyService } from "@/lib/services/currency";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "../ui/card";
import BarcodeButton from "./components/BarcodeButton";

interface StockListProps {
  onMenuItemClick: (itemName: string) => void;
}

const StockList: React.FC<StockListProps> = ({ onMenuItemClick }) => {
  const { toast } = useToast();
  const [stockData, setStockData] = useState<StockCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exchangeRates, setExchangeRates] = useState<{
    USD_TRY: number;
    EUR_TRY: number;
  } | null>(null);
  const dataGridRef = useRef<DataGrid>(null);
  const [quickFilterText, setQuickFilterText] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bulkActionsOpen, setBulkActionsOpen] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);

  const [settings, setSettings] = useState({
    showGroupPanel: true,
    showFilterRow: true,
    showHeaderFilter: true,
    alternateRowColoring: true,
    pageSize: "50",
    virtualScrolling: true,
  });

  const onSelectionChanged = useCallback((e: any) => {
    setSelectedRowKeys(e.selectedRowKeys);
  }, []);

  const selectedStocks = stockData.filter((stock) =>
    selectedRowKeys.includes(stock.id)
  );

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [stockResponse, ratesResponse] = await Promise.all([
        fetch(`${process.env.BASE_URL}/stockcards/stockCardsWithRelations`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          credentials: "include",
        }),
        currencyService.getExchangeRates(),
      ]);

      if (!stockResponse.ok) {
        throw new Error("Failed to fetch stock data");
      }

      const data = await stockResponse.json();
      setStockData(data);
      setExchangeRates(ratesResponse);
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
        description: "Failed to fetch stock data. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRowDblClick = useCallback(
    async (e: any) => {
      try {
        // Store the stock data in localStorage
        localStorage.setItem("currentStockData", JSON.stringify(e.data));

        // Open the stock form in a new tab
        onMenuItemClick("Stok Formu");

        toast({
          title: "Success",
          description: "Opening stock form...",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to open stock form. Please try again.",
        });
        console.error(error);
      }
    },
    [onMenuItemClick, toast]
  );

  const handleDeleteSelected = useCallback(async () => {
    if (selectedRowKeys.length === 0) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Lütfen silmek için en az bir stok seçin.",
      });
      return;
    }

    try {
      setLoading(true);
      const ids = selectedRowKeys.map((key) => key.id); // Ensure only ids are sent
      const response = await fetch(
        `${process.env.BASE_URL}/stockcards/deleteManyStockCardsWithRelations/`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          credentials: "include",
          body: JSON.stringify({ ids }),
        }
      );

      if (!response.ok) {
        throw new Error("Silme işlemi başarısız oldu.");
      }

      toast({
        title: "Başarılı",
        description: "Seçili stoklar başarıyla silindi.",
      });

      await fetchData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description:
          error instanceof Error
            ? error.message
            : "Bilinmeyen bir hata oluştu.",
      });
    } finally {
      setLoading(false);
      setBulkActionsOpen(false);
    }
  }, [selectedRowKeys, fetchData, toast]);

  const onExporting = React.useCallback((e: any) => {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Stock List");

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
          "StockList.xlsx"
        );
      });
    });
  }, []);

  const applyQuickFilter = useCallback(() => {
    if (!dataGridRef.current) return;

    const instance = dataGridRef.current.instance;
    if (quickFilterText) {
      instance.filter([
        ["productCode", "contains", quickFilterText],
        "or",
        ["productName", "contains", quickFilterText],
        "or",
        ["barcodes[0].barcode", "contains", quickFilterText],
      ]);
    } else {
      instance.clearFilter();
    }
  }, [quickFilterText]);

  const handleImport = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        toast({
          title: "Success",
          description: `File "${file.name}" imported successfully.`,
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to import file. Please try again.",
        });
      } finally {
        setLoading(false);
        if (event.target) {
          event.target.value = "";
        }
      }
    },
    [toast]
  );

  const calculateTotalQuantity = useCallback((rowData: StockCard) => {
    return rowData.stockCardWarehouse.reduce((total, warehouse) => {
      return total + parseInt(warehouse.quantity, 10);
    }, 0);
  }, []);

  const renderPriceWithTRY = useCallback(
    (price: number, currency: string) => {
      if (!exchangeRates || currency === "TRY") return price.toFixed(2);

      const rate =
        currency === "USD" ? exchangeRates.USD_TRY : exchangeRates.EUR_TRY;
      const tryPrice = price * rate;
      return `${price.toFixed(2)} (₺${tryPrice.toFixed(2)})`;
    },
    [exchangeRates]
  );

  const getCategoryPath = useCallback((rowData: StockCard) => {
    if (!rowData.stockCardCategoryItem?.length) return "";

    const category = rowData.stockCardCategoryItem[0];
    if (!category.parentCategories)
      return category.stockCardCategory.categoryName;

    return category.parentCategories
      .slice()
      .reverse()
      .map((cat) => cat.categoryName)
      .join(" > ");
  }, []);

  const renderToolbarContent = useCallback(
    () => (
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Input
            placeholder="Hızlı arama..."
            value={quickFilterText}
            onChange={(e) => setQuickFilterText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyQuickFilter()}
            className="max-w-xs"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (dataGridRef.current) {
              dataGridRef.current.instance.clearFilter();
              setQuickFilterText("");
            }
          }}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtreleri Temizle
        </Button>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Yenile
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4 mr-2" />
          İçeri Aktar
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImport}
          accept=".xlsx,.xls"
          className="hidden"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSettingsOpen(true)}
        >
          <Settings className="h-4 w-4 mr-2" />
          Ayarlar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setBulkActionsOpen(!bulkActionsOpen)}
        >
          <CheckSquare className="h-4 w-4 mr-2" />
          Toplu İşlemler
        </Button>
      </div>
    ),
    [
      quickFilterText,
      applyQuickFilter,
      fetchData,
      handleImport,
      bulkActionsOpen,
    ]
  );

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {renderToolbarContent()}

      {bulkActionsOpen && (
        <Card className="p-4 rounded-md flex items-center">
          <div className="flex gap-2">
            <Button variant="destructive" onClick={handleDeleteSelected}>
              Seçili Olanları Sil
            </Button>
            {selectedRowKeys && <BarcodeButton stocks={selectedStocks} />}
          </div>
        </Card>
      )}

      <DataGrid
        ref={dataGridRef}
        dataSource={stockData}
        showBorders={true}
        showRowLines={true}
        showColumnLines={true}
        rowAlternationEnabled={settings.alternateRowColoring}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnAutoWidth={true}
        wordWrapEnabled={true}
        onExporting={onExporting}
        height="calc(100vh - 200px)"
        selectedRowKeys={selectedRowKeys}
        selection={{ mode: "multiple" }}
        onSelectionChanged={onSelectionChanged}
        onRowDblClick={handleRowDblClick}
        loadPanel={{
          enabled: loading,
          showIndicator: true,
          showPane: true,
          text: "Loading...",
        }}
      >
        <StateStoring
          enabled={true}
          type="localStorage"
          storageKey="stockListGrid"
        />
        <Selection mode="multiple" showCheckBoxesMode="always" />
        <FilterRow visible={settings.showFilterRow} />
        <HeaderFilter visible={settings.showHeaderFilter} />
        <FilterPanel visible={true} />
        <FilterBuilderPopup position={{ my: "top", at: "top", of: window }} />
        <GroupPanel visible={settings.showGroupPanel} />
        <Grouping autoExpandAll={false} />
        <Scrolling
          mode={settings.virtualScrolling ? "virtual" : "standard"}
          rowRenderingMode={settings.virtualScrolling ? "virtual" : "standard"}
          columnRenderingMode={
            settings.virtualScrolling ? "virtual" : "standard"
          }
        />
        <Paging enabled={true} pageSize={parseInt(settings.pageSize)} />
        <Export enabled={true} allowExportSelectedData={true} />
        <ColumnChooser enabled={true} mode="select" />

        <Column
          dataField="productCode"
          caption="Stock Code"
          width={120}
          fixed={true}
        />
        <Column dataField="productName" caption="Stock Name" width={200} />
        <Column dataField="brand.brandName" caption="Brand" width={120} />
        <Column dataField="unit" caption="Unit" width={80} />
        <Column
          caption="Category"
          calculateCellValue={getCategoryPath}
          width={200}
        />
        <Column
          caption="Total Stock"
          calculateCellValue={calculateTotalQuantity}
          dataType="number"
          format="#,##0"
          width={100}
        />

        <Column caption="Warehouses">
          {stockData[0]?.stockCardWarehouse.map((warehouse) => (
            <Column
              key={warehouse.warehouse.id}
              caption={warehouse.warehouse.warehouseName}
              calculateCellValue={(rowData: StockCard) => {
                const warehouseData = rowData.stockCardWarehouse.find(
                  (w) => w.warehouse.id === warehouse.warehouse.id
                );
                return warehouseData ? parseInt(warehouseData.quantity, 10) : 0;
              }}
              dataType="number"
              format="#,##0"
              width={100}
            />
          ))}
        </Column>

        <Column caption="Prices">
          {stockData[0]?.stockCardPriceLists.map((priceList) => (
            <Column
              key={priceList.priceList.id}
              caption={`${priceList.priceList.priceListName} (${priceList.priceList.currency})`}
              calculateCellValue={(rowData: StockCard) => {
                const priceData = rowData.stockCardPriceLists.find(
                  (p) => p.priceList.id === priceList.priceList.id
                );
                if (!priceData) return 0;

                const price = parseFloat(priceData.price);
                return priceList.priceList.currency === "USD"
                  ? renderPriceWithTRY(price, "USD")
                  : price.toFixed(2);
              }}
              width={150}
            />
          ))}
        </Column>

        <Column dataField="productType" caption="Product Type" width={120} />
        <Column
          dataField="stockStatus"
          caption="Status"
          dataType="boolean"
          width={80}
        />
        <Column
          dataField="createdAt"
          caption="Created Date"
          dataType="datetime"
          format="dd.MM.yyyy HH:mm"
          width={140}
        />

        <Summary>
          <TotalItem
            column="Total Stock"
            summaryType="sum"
            valueFormat="#,##0"
          />
        </Summary>

        <Toolbar>
          <Item name="groupPanel" />
          <Item name="exportButton" />
          <Item name="columnChooserButton" />
        </Toolbar>
      </DataGrid>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Table Settings</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="showGroupPanel">Show Group Panel</Label>
              <Switch
                id="showGroupPanel"
                checked={settings.showGroupPanel}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, showGroupPanel: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="showFilterRow">Show Filter Row</Label>
              <Switch
                id="showFilterRow"
                checked={settings.showFilterRow}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, showFilterRow: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="showHeaderFilter">Show Header Filter</Label>
              <Switch
                id="showHeaderFilter"
                checked={settings.showHeaderFilter}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({
                    ...prev,
                    showHeaderFilter: checked,
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="alternateRowColoring">
                Alternate Row Coloring
              </Label>
              <Switch
                id="alternateRowColoring"
                checked={settings.alternateRowColoring}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({
                    ...prev,
                    alternateRowColoring: checked,
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="virtualScrolling">Virtual Scrolling</Label>
              <Switch
                id="virtualScrolling"
                checked={settings.virtualScrolling}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({
                    ...prev,
                    virtualScrolling: checked,
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="pageSize">Page Size</Label>
              <Select
                value={settings.pageSize}
                onValueChange={(value) =>
                  setSettings((prev) => ({ ...prev, pageSize: value }))
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select page size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 rows</SelectItem>
                  <SelectItem value="25">25 rows</SelectItem>
                  <SelectItem value="50">50 rows</SelectItem>
                  <SelectItem value="100">100 rows</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockList;
