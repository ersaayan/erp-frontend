"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import DataGrid, {
  Column,
  Selection,
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
} from "devextreme-react/data-grid";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Printer, AlertCircle } from "lucide-react";
import { Workbook } from "exceljs";
import { saveAs } from "file-saver-es";
import { exportDataGrid } from "devextreme/excel_exporter";
import { BarcodePrinter } from "@/lib/services/barcode/printer";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PrintQueueItem {
  id: string;
  productCode: string;
  quantity: number;
}

const PrintQueue: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [queueItems, setQueueItems] = useState<PrintQueueItem[]>([]);

  const fetchQueueItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.BASE_URL}/print-queue/pending`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Yazdırma kuyruğu yüklenirken bir hata oluştu");
      }

      const result = await response.json();
      setQueueItems(result.body.data);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Yazdırma kuyruğu yüklenirken beklenmeyen bir hata oluştu";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Hata",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchQueueItems();
  }, [fetchQueueItems]);

  // DataGrid'in seçim değişikliği eventi
  const handleSelectionChanged = (e: any) => {
    console.log("Seçim değişti:", e);
    setSelectedRowKeys(e.selectedRowKeys);
  };

  // Seçili ürünlerin toplam etiket sayısını hesaplayan fonksiyon
  const calculateTotalLabels = useCallback(() => {
    const selectedItems = queueItems.filter((item) =>
      selectedRowKeys.includes(item.id)
    );

    const total = selectedItems.reduce((sum, item) => {
      return sum + item.quantity;
    }, 0);

    return total;
  }, [queueItems, selectedRowKeys]);

  const handlePrint = async () => {
    if (selectedRowKeys.length === 0) {
      const errorMessage = "Lütfen yazdırılacak öğeleri seçin";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Hata",
        description: errorMessage,
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const selectedItems = queueItems.filter((item) =>
        selectedRowKeys.includes(item.id)
      );
      console.log("Yazdırılacak ürünler:", selectedItems);

      const totalLabels = calculateTotalLabels();
      console.log("Yazdırılacak toplam etiket:", totalLabels);

      // Kullanıcıya onay mesajı göster
      if (
        !window.confirm(
          `${selectedItems.length} üründen toplam ${totalLabels} adet etiket yazdırılacak. Devam etmek istiyor musunuz?`
        )
      ) {
        setLoading(false);
        return;
      }

      // BarcodePrinter servisini kullanarak barkodları yazdır
      const printer = new BarcodePrinter();

      // Tüm ürünlerin barkodlarını tek bir dizide topla
      const allBarcodes = selectedItems.flatMap((item) =>
        Array(item.quantity).fill({
          stockCode: item.productCode,
        })
      );

      // Tüm barkodları tek seferde yazdır
      await printer.printBarcodes(allBarcodes);

      // Yazdırılan öğeleri kuyruktan kaldır
      await Promise.all(
        selectedItems.map(async (item) => {
          const response = await fetch(
            `${process.env.BASE_URL}/print-queue/${item.id}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error(
              `${item.productCode} kodlu ürün kuyruktan kaldırılamadı`
            );
          }
        })
      );

      toast({
        title: "Başarılı",
        description: `${selectedItems.length} üründen toplam ${totalLabels} adet etiket başarıyla yazdırıldı ve kuyruktan kaldırıldı`,
      });

      // Listeyi yenile
      fetchQueueItems();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Yazdırma işlemi sırasında beklenmeyen bir hata oluştu";

      setError(errorMessage);
      console.error("Yazdırma hatası:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const onExporting = useCallback((e: any) => {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Yazdırma Kuyruğu");

    const selectedData = e.component.getSelectedRowsData();

    exportDataGrid({
      component: e.component,
      worksheet,
      selectedRowsOnly: selectedData.length > 0,
      autoFilterEnabled: true,
      customizeCell: ({ gridCell, excelCell }: any) => {
        if (gridCell.rowType === "data") {
          if (typeof gridCell.value === "number") {
            excelCell.numFmt = "#,##0";
          }
        }
      },
    }).then(() => {
      workbook.xlsx.writeBuffer().then((buffer) => {
        saveAs(
          new Blob([buffer], { type: "application/octet-stream" }),
          "YazdirmaKuyrugu.xlsx"
        );
      });
    });
  }, []);

  if (loading && queueItems.length === 0) {
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
        <h2 className="text-2xl font-bold">Yazdırma Kuyruğu</h2>
        <Button
          variant="default"
          size="sm"
          onClick={handlePrint}
          disabled={selectedRowKeys.length === 0 || loading}
          className="bg-[#84CC16] hover:bg-[#65A30D]"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Printer className="h-4 w-4 mr-2" />
          )}
          {loading
            ? "Yazdırılıyor..."
            : `Yazdır (${
                selectedRowKeys.length
              } ürün - ${calculateTotalLabels()} etiket)`}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="flex-1">
        <DataGrid
          dataSource={queueItems}
          showBorders={true}
          showRowLines={true}
          showColumnLines={true}
          rowAlternationEnabled={true}
          columnAutoWidth={true}
          wordWrapEnabled={true}
          height="calc(100vh - 12rem)"
          selectedRowKeys={selectedRowKeys}
          onSelectionChanged={handleSelectionChanged}
          keyExpr="id"
          onExporting={onExporting}
        >
          <StateStoring
            enabled={true}
            type="localStorage"
            storageKey="printQueueGrid"
          />
          <LoadPanel enabled={true} />
          <Selection mode="multiple" showCheckBoxesMode="always" />
          <FilterRow visible={true} />
          <HeaderFilter visible={true} />
          <SearchPanel visible={true} width={240} placeholder="Ara..." />
          <ColumnChooser enabled={true} mode="select" />
          <Scrolling mode="virtual" />
          <Export enabled={true} allowExportSelectedData={true} />

          <Column
            dataField="productCode"
            caption="Ürün Kodu"
            allowHeaderFiltering={true}
          />
          <Column
            dataField="quantity"
            caption="Miktar"
            dataType="number"
            format="#,##0"
            allowHeaderFiltering={true}
          />

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

export default PrintQueue;
