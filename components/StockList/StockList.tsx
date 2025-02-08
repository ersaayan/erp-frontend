"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import DataGrid, {
  Column,
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
import PrintBarcodeDialog from "./components/PrintBarcodeDialog";
import { PrintBarcodeItem } from "./types";

interface StockListProps {
  onMenuItemClick: (itemName: string) => void;
}

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [quickFilterText, setQuickFilterText] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [bulkActionsOpen, setBulkActionsOpen] = useState(false);
  const [selectedStocks, setSelectedStocks] = useState<StockCard[]>([]);
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
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);

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

  const handlePrintDialogOpen = useCallback(() => {
    if (selectedRowKeys.length === 0) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Lütfen en az bir stok kartı seçin",
      });
      return;
    }
    setIsPrintDialogOpen(true);
  }, [selectedRowKeys, toast]);

  const handlePrintBarcodes = useCallback(
    async (items: PrintBarcodeItem[]) => {
      try {
        const printer = new BarcodePrinter();
        const barcodes = items.flatMap((item) => {
          const barcodeData = {
            stockCode: item.stockCard.productCode,
            // Diğer barkod verileri buraya eklenebilir
          };
          return Array(item.quantity).fill(barcodeData);
        });

        await printer.printBarcodes(barcodes);
        setIsPrintDialogOpen(false);
        toast({
          title: "Başarılı",
          description: "Barkodlar yazdırılıyor...",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Hata",
          description:
            error instanceof Error ? error.message : "Yazdırma hatası oluştu",
        });
      }
    },
    [toast]
  );

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

  const handleExport = useCallback(async () => {
    try {
      setLoading(true);
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet("Stok Listesi");

      // Sütun başlıklarını ayarla
      worksheet.columns = [
        { header: "productCode", key: "productCode", width: 20 },
        { header: "productName", key: "productName", width: 30 },
        { header: "unit", key: "unit", width: 10 },
        { header: "shortDescription", key: "shortDescription", width: 40 },
        { header: "description", key: "description", width: 40 },
        { header: "companyCode", key: "companyCode", width: 15 },
        { header: "branchCode", key: "branchCode", width: 15 },
        { header: "gtip", key: "gtip", width: 15 },
        { header: "pluCode", key: "pluCode", width: 15 },
        { header: "desi", key: "desi", width: 10 },
        { header: "adetBoleni", key: "adetBoleni", width: 10 },
        { header: "siraNo", key: "siraNo", width: 10 },
        { header: "raf", key: "raf", width: 10 },
        { header: "karMarji", key: "karMarji", width: 10 },
        { header: "riskQuantities", key: "riskQuantities", width: 15 },
        { header: "maliyet", key: "maliyet", width: 10 },
        { header: "maliyetKur", key: "maliyetKur", width: 10 },
        { header: "warehouseName", key: "warehouseName", width: 15 },
        { header: "quantity", key: "quantity", width: 10 },
        { header: "brandName", key: "brandName", width: 15 },
        { header: "productType", key: "productType", width: 15 },
        { header: "categories", key: "categories", width: 20 },
        { header: "attributes", key: "attributes", width: 30 },
        { header: "vatRate", key: "vatRate", width: 10 },
        { header: "prices", key: "prices", width: 40 },
        { header: "barcodes", key: "barcodes", width: 30 },
        { header: "marketNames", key: "marketNames", width: 20 },
      ];

      // Başlık satırını formatla
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E6EF" },
      };

      // Verileri ekle
      const rows = stockData.map((stock) => ({
        productCode: stock.productCode || "",
        productName: stock.productName || "",
        unit: stock.unit || "",
        shortDescription: stock.shortDescription || "",
        description: stock.description || "",
        companyCode: stock.companyCode || "",
        branchCode: stock.branchCode || "",
        gtip: stock.gtip || "",
        pluCode: stock.pluCode || "",
        desi: stock.desi || "0",
        adetBoleni: stock.adetBoleni || "1",
        siraNo: stock.siraNo || "",
        raf: stock.raf || "",
        karMarji: stock.karMarji || "20",
        riskQuantities: stock.riskQuantities || "50",
        maliyet: stock.maliyet || "",
        maliyetKur: stock.maliyetDoviz || "",
        warehouseName:
          stock.stockCardWarehouse?.[0]?.warehouse?.warehouseName || "",
        quantity: stock.stockCardWarehouse?.[0]?.quantity || "0",
        brandName: stock.brand?.brandName || "",
        productType: stock.productType || "BasitUrun",
        categories:
          stock.stockCardCategoryItem
            ?.map((cat) => cat.stockCardCategory.categoryName)
            .join(",") || "",
        attributes:
          stock.stockCardAttributeItems
            ?.map(
              (attr) =>
                `${attr.attribute.attributeName}=${attr.attribute.value}`
            )
            .join(",") || "",
        vatRate: stock.vatRate || "",
        prices:
          stock.stockCardPriceLists
            ?.map((pl) => `${pl.priceList.priceListName}=${pl.price}`)
            .join(",") || "",
        barcodes: stock.barcodes?.map((b) => b.barcode).join(",") || "",
        marketNames:
          stock.stockCardMarketNames?.map((m) => m.marketName).join(",") || "",
      }));

      worksheet.addRows(rows);

      // Tüm hücrelere border ekle
      worksheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      });

      // Excel dosyasını oluştur ve indir
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(
        new Blob([buffer], { type: "application/octet-stream" }),
        "StokListesi.xlsx"
      );

      toast({
        title: "Başarılı",
        description: "Excel dosyası başarıyla oluşturuldu.",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Excel dosyası oluşturulurken bir hata oluştu.",
      });
    } finally {
      setLoading(false);
    }
  }, [stockData, toast]);

  const renderToolbarContent = useCallback(
    () => (
      <div className="space-y-4">
        {/* Ana Toolbar */}
        <div className="flex items-center gap-4 bg-white p-2 rounded-lg shadow-sm border">
          {/* Arama Grubu */}
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-md">
              <Input
                placeholder="Stok kodu, adı veya barkod ile arama..."
                value={quickFilterText}
                onChange={(e) => setQuickFilterText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyQuickFilter()}
                className="pl-10"
              />
              <Filter className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (dataGridRef.current) {
                  dataGridRef.current.instance.clearFilter();
                  setQuickFilterText("");
                }
              }}
            >
              Filtreleri Temizle
            </Button>
          </div>

          {/* Dikey Ayırıcı */}
          <div className="h-8 w-px bg-gray-200" />

          {/* Veri İşlemleri Grubu */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={fetchData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Yenile
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleExport()}>
              <Download className="h-4 w-4 mr-2" />
              Dışa Aktar
            </Button>
          </div>

          {/* Dikey Ayırıcı */}
          <div className="h-8 w-px bg-gray-200" />

          {/* İçe Aktarma Grubu */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
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
              Şablon
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              İçe Aktar
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              accept=".xlsx,.xls"
              className="hidden"
            />
          </div>

          {/* Dikey Ayırıcı */}
          <div className="h-8 w-px bg-gray-200" />

          {/* Ayarlar ve İşlemler Grubu */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Ayarlar
            </Button>
            <Button
              variant={bulkActionsOpen ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setBulkActionsOpen(!bulkActionsOpen)}
              className="font-medium"
              disabled={selectedRowKeys.length === 0}
            >
              <CheckSquare
                className={`h-4 w-4 mr-2 ${
                  selectedRowKeys.length === 0 ? "text-gray-400" : ""
                }`}
              />
              Toplu İşlemler{" "}
              {selectedRowKeys.length > 0 && `(${selectedRowKeys.length})`}
            </Button>
          </div>
        </div>

        {/* Toplu İşlemler Paneli */}
        {bulkActionsOpen && (
          <Card className="bg-gray-50/50">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700">
                  Toplu İşlemler
                </h3>
                <span className="text-sm text-gray-500">
                  {selectedRowKeys.length} öğe seçili
                </span>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 bg-white hover:bg-gray-50"
                  onClick={() => setBulkPriceUpdateOpen(true)}
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Fiyat Güncelle
                </Button>
                <Button
                  variant="outline"
                  onClick={handlePrintDialogOpen}
                  disabled={selectedRowKeys.length === 0}
                  className="flex-1 bg-white hover:bg-gray-50"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Barkod Yazdır
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                  onClick={handleDeleteSelected}
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Seçilenleri Sil
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    ),
    [
      quickFilterText,
      fetchData,
      handleImport,
      bulkActionsOpen,
      selectedRowKeys.length,
      handleDeleteSelected,
      applyQuickFilter,
      handleExport,
      handlePrintDialogOpen,
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

      <PrintBarcodeDialog
        open={isPrintDialogOpen}
        onOpenChange={setIsPrintDialogOpen}
        selectedStocks={selectedStocks}
        onPrint={handlePrintBarcodes}
      />
    </div>
  );
};

export default StockList;
