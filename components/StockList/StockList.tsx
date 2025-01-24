"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
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
  Download,
  Loader2,
  Printer,
  RefreshCw,
  Settings,
  Upload,
  DollarSign,
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
import { BarcodePrinter } from "@/lib/services/barcode/printer";
import { BarcodeData } from "@/lib/services/barcode/types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface BulkPriceUpdateInput {
  priceListId: string;
  stockCardIds: string[];
  updateType: "PERCENTAGE" | "FIXED_AMOUNT" | "NEW_PRICE";
  value: number;
  roundingDecimal?: number;
  updateVatRate?: boolean;
  newVatRate?: number;
}

const bulkPriceUpdateSchema = z.object({
  priceListId: z.string().min(1, "Fiyat listesi seçiniz"),
  updateType: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "NEW_PRICE"], {
    required_error: "Güncelleme tipi seçiniz",
  }),
  value: z.number().min(0, "Değer 0'dan büyük olmalıdır"),
  roundingDecimal: z.number().min(0).max(4).optional(),
  updateVatRate: z.boolean().default(false),
  newVatRate: z.number().min(0).max(100).optional(),
});

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
  const [selectedStocks, setSelectedStocks] = useState<StockCard[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [settings, setSettings] = useState({
    showGroupPanel: true,
    showFilterRow: true,
    showHeaderFilter: true,
    alternateRowColoring: true,
    pageSize: "50",
    virtualScrolling: true,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkPriceUpdateOpen, setBulkPriceUpdateOpen] = useState(false);

  const bulkPriceUpdateForm = useForm<z.infer<typeof bulkPriceUpdateSchema>>({
    resolver: zodResolver(bulkPriceUpdateSchema),
    defaultValues: {
      updateType: "PERCENTAGE",
      value: 0,
      roundingDecimal: 2,
      updateVatRate: false,
    },
  });

  // Get all unique warehouses and price lists
  const getAllWarehouses = useCallback(() => {
    const warehousesSet = new Set<string>();
    const warehousesList: Array<{ id: string; name: string }> = [];

    stockData.forEach((stock) => {
      stock.stockCardWarehouse?.forEach((warehouse) => {
        const warehouseId = warehouse?.warehouse?.id;
        if (warehouseId && !warehousesSet.has(warehouseId)) {
          warehousesSet.add(warehouseId);
          warehousesList.push({
            id: warehouseId,
            name: warehouse.warehouse.warehouseName,
          });
        }
      });
    });

    return warehousesList;
  }, [stockData]);

  const getAllPriceLists = useCallback(() => {
    const priceListsSet = new Set<string>();
    const priceListsList: Array<{
      id: string;
      name: string;
      currency: string;
    }> = [];

    stockData.forEach((stock) => {
      stock.stockCardPriceLists?.forEach((priceList) => {
        const priceListId = priceList?.priceList?.id;
        if (priceListId && !priceListsSet.has(priceListId)) {
          priceListsSet.add(priceListId);
          priceListsList.push({
            id: priceListId,
            name: priceList.priceList.priceListName,
            currency: priceList.priceList.currency,
          });
        }
      });
    });

    return priceListsList;
  }, [stockData]);

  const onSelectionChanged = useCallback((e: any) => {
    setSelectedRowKeys(e.selectedRowKeys);
    setSelectedStocks(e.selectedRowsData || []);
  }, []);

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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRowDblClick = useCallback(
    async (e: any) => {
      try {
        localStorage.setItem("currentStockData", JSON.stringify(e.data));
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

  const handlePrint = useCallback(async () => {
    if (selectedRowKeys.length === 0) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Lütfen en az bir ürün seçin",
      });
      return;
    }

    try {
      setLoading(true);
      const barcodeData: BarcodeData[] = selectedStocks
        .sort((a, b) => a.productCode.localeCompare(b.productCode))
        .map((stock) => ({
          stockCode: stock.productCode,
          stockName: stock.productName,
          barcode: stock.barcodes?.[0]?.barcode || stock.productCode,
        }));

      const printer = new BarcodePrinter();
      await printer.printBarcodes(barcodeData);
      toast({
        title: "Başarılı",
        description: "Barkod yazdırma işlemi başlatıldı",
      });
    } catch (error) {
      console.error("Print error:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description:
          error instanceof Error
            ? error.message
            : "Yazdırma işlemi başarısız oldu",
      });
    } finally {
      setLoading(false);
      setShowPreview(false);
    }
  }, [selectedStocks, toast, selectedRowKeys.length]);

  const handleDeleteSelected = useCallback(async () => {
    if (selectedRowKeys.length === 0) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Lütfen silmek için en az bir stok kartı seçin",
      });
      return;
    }
    setDeleteDialogOpen(true);
  }, [selectedRowKeys.length, toast]);

  const confirmDelete = async () => {
    try {
      setLoading(true);
      // API endpoint'i ve silme işlemi burada implement edilecek
      const response = await fetch(
        `${process.env.BASE_URL}/stockcards/deleteManyStockCardsWithRelations/`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: JSON.stringify({ ids: selectedRowKeys }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Silme işlemi başarısız oldu");
      }

      toast({
        title: "Başarılı",
        description: "Seçili stok kartları başarıyla silindi",
      });

      setDeleteDialogOpen(false);
      fetchData(); // Listeyi yenile
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description:
          error instanceof Error
            ? error.message
            : "Silme işlemi sırasında bir hata oluştu",
      });
    } finally {
      setLoading(false);
    }
  };

  const onExporting = useCallback((e: any) => {
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
      if (!file) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Lütfen bir dosya seçin",
        });
        return;
      }

      setLoading(true);
      try {
        const formData = new FormData();
        formData.append("excelFile", file);

        const response = await fetch(`${process.env.BASE_URL}/import-stock`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          credentials: "include",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Dosya yükleme başarısız oldu");
        }

        await fetchData(); // Stok listesini yenile

        toast({
          title: "Success",
          description: `${file.name} dosyası başarıyla içe aktarıldı.`,
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Dosya içe aktarma işlemi başarısız oldu.",
        });
      } finally {
        setLoading(false);
        if (event.target) {
          event.target.value = "";
        }
      }
    },
    [toast, fetchData]
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
          onClick={() => {
            const link = document.createElement("a");
            link.href = "/stock_card_import.xlsx";
            link.download = "stock_card_import.xlsx";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        >
          <Download className="h-4 w-4 mr-2" />
          Şablon İndir
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

  const handleBulkPriceUpdate = async (
    values: z.infer<typeof bulkPriceUpdateSchema>
  ) => {
    if (selectedRowKeys.length === 0) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Lütfen en az bir ürün seçin",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.BASE_URL}/stockcards/bulkUpdatePrices`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: JSON.stringify({
            ...values,
            stockCardIds: selectedStocks.map((stock) => stock.id),
          } as BulkPriceUpdateInput),
        }
      );

      if (!response.ok) {
        throw new Error("Fiyat güncelleme işlemi başarısız oldu");
      }

      toast({
        title: "Başarılı",
        description: "Fiyatlar başarıyla güncellendi",
      });
      setBulkPriceUpdateOpen(false);
      fetchData();
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
        <Card className="p-4 rounded-md">
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => {
                setBulkPriceUpdateOpen(true);
              }}
            >
              <DollarSign className="mr-2 h-4 w-4" />
              Toplu Fiyat Güncelleme
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPreview(true)}
              disabled={selectedRowKeys.length === 0 || loading}
              className="min-w-[120px]"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Printer className="h-4 w-4 mr-2" />
              )}
              {loading ? "Yazdırılıyor..." : "Barkod Yazdır"}
            </Button>
            <Button variant="destructive" onClick={handleDeleteSelected}>
              Seçili Olanları Sil
            </Button>
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
        width={"100%"}
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

        <Column dataField="productCode" caption="Stok Kodu" fixed={true} />
        <Column dataField="productName" caption="Stok Adı" minWidth={200} />
        <Column dataField="brand.brandName" caption="Marka" />
        <Column dataField="unit" caption="Birim" />
        <Column caption="Kategori" calculateCellValue={getCategoryPath} />

        <Column caption="Depolar">
          {getAllWarehouses().map((warehouse) => (
            <Column
              key={warehouse.id}
              dataField={`stockCardWarehouse.${warehouse.id}.quantity`}
              caption={warehouse.name}
              calculateCellValue={(rowData: StockCard) => {
                const warehouseData = rowData.stockCardWarehouse.find(
                  (w) => w?.warehouse?.id === warehouse.id
                );
                return warehouseData ? parseInt(warehouseData.quantity, 10) : 0;
              }}
              dataType="number"
              format="#,##0"
            />
          ))}
        </Column>

        <Column caption="Fiyatlar">
          {getAllPriceLists().map((priceList) => (
            <Column
              key={priceList.id}
              caption={`${priceList.name} (${priceList.currency})`}
              calculateCellValue={(rowData: StockCard) => {
                const priceData = rowData.stockCardPriceLists.find(
                  (p) => p?.priceList?.id === priceList.id
                );
                if (!priceData) return 0;

                const price = parseFloat(priceData.price);
                return priceList.currency === "USD"
                  ? renderPriceWithTRY(price, "USD")
                  : price.toFixed(2);
              }}
            />
          ))}
        </Column>

        <Column dataField="productType" caption="Stok Tipi" />
        <Column dataField="stockStatus" caption="Durum" dataType="boolean" />
        <Column
          dataField="createdAt"
          caption="Created Date"
          dataType="datetime"
          format="dd.MM.yyyy HH:mm"
        />

        <Summary>
          {getAllWarehouses().map((warehouse) => (
            <TotalItem
              key={warehouse.id}
              column={warehouse.name}
              summaryType="sum"
              valueFormat="#,##0"
            />
          ))}
          <TotalItem
            column="Toplam Stok"
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Stok Kartlarını Sil</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Aşağıdaki stok kartlarını silmek istediğinize emin misiniz? Bu
                işlem geri alınamaz.
              </AlertDescription>
            </Alert>
            <div className="mt-4 space-y-2">
              {selectedStocks.map((stock) => (
                <Card key={stock.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{stock.productName}</p>
                      <p className="text-sm text-gray-500">
                        Kod: {stock.productCode}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Hayır, İptal Et
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Evet, Sil
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkPriceUpdateOpen} onOpenChange={setBulkPriceUpdateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Toplu Fiyat Güncelleme</DialogTitle>
          </DialogHeader>
          <Form {...bulkPriceUpdateForm}>
            <form
              onSubmit={bulkPriceUpdateForm.handleSubmit(handleBulkPriceUpdate)}
              className="space-y-4"
            >
              <FormField
                control={bulkPriceUpdateForm.control}
                name="priceListId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fiyat Listesi</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Fiyat listesi seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getAllPriceLists().map((priceList) => (
                          <SelectItem key={priceList.id} value={priceList.id}>
                            {priceList.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={bulkPriceUpdateForm.control}
                name="updateType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Güncelleme Tipi</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Güncelleme tipi seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">
                          Yüzdelik Artış
                        </SelectItem>
                        <SelectItem value="FIXED_AMOUNT">
                          Sabit Tutar Artış
                        </SelectItem>
                        <SelectItem value="NEW_PRICE">Yeni Fiyat</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={bulkPriceUpdateForm.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Değer</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={bulkPriceUpdateForm.control}
                name="roundingDecimal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Yuvarlama Hassasiyeti</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="4"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={bulkPriceUpdateForm.control}
                name="updateVatRate"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>KDV Oranını Güncelle</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              {bulkPriceUpdateForm.watch("updateVatRate") && (
                <FormField
                  control={bulkPriceUpdateForm.control}
                  name="newVatRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Yeni KDV Oranı (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Güncelle
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl flex flex-col h-[80vh] p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>Barkod Yazdırma Önizleme</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-2">
              <p className="font-medium">
                Seçili Ürünler ({selectedStocks.length}):
              </p>
              <div className="border rounded-md">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-2 text-left">Stok Kodu</th>
                      <th className="px-4 py-2 text-left">Stok Adı</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStocks
                      .sort((a, b) =>
                        a.productCode.localeCompare(b.productCode)
                      )
                      .map((stock) => (
                        <tr key={stock.id} className="border-t">
                          <td className="px-4 py-2">{stock.productCode}</td>
                          <td className="px-4 py-2">{stock.productName}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="mt-auto border-t bg-background px-6 py-4">
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                İptal
              </Button>
              <Button
                onClick={handlePrint}
                className="bg-[#84CC16] hover:bg-[#65A30D]"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Yazdır
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockList;
