/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import DataGrid, {
  Column,
  FilterRow,
  HeaderFilter,
  Grouping,
  GroupPanel,
  Paging,
  Scrolling,
  SearchPanel,
  Selection,
  Toolbar,
  Item,
  ColumnChooser,
  ColumnFixing,
  StateStoring,
  LoadPanel,
  Lookup,
} from "devextreme-react/data-grid";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { Receipt } from "./types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import ReceiptDetailDialog from "./ReceiptDetailDialog";

const receiptTypes = [
  { id: "Giris", name: "Giriş Fişi" },
  { id: "Cikis", name: "Çıkış Fişi" },
];

const ReceiptListGrid: React.FC = () => {
  const { toast } = useToast();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(
    null
  );
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  const dataSource = useMemo(
    () => ({
      store: {
        type: "custom",
        load: async (loadOptions: any) => {
          try {
            setLoading(true);

            // Sayfalama parametreleri
            const page = loadOptions.skip
              ? Math.floor(loadOptions.skip / loadOptions.take) + 1
              : 1;
            const limit = loadOptions.take || 20;

            // Filtreleme parametreleri
            const filter: any = {};
            if (loadOptions.filter) {
              loadOptions.filter.forEach((f: any) => {
                if (f[1] === "contains") {
                  filter[f[0]] = f[2];
                } else if (f[1] === "=") {
                  filter[f[0]] = f[2];
                }
              });
            }

            // Tarih filtresi varsa
            if (filter.receiptDate) {
              const date = new Date(filter.receiptDate);
              filter.startDate = date.toISOString().split("T")[0];
              filter.endDate = date.toISOString().split("T")[0];
              delete filter.receiptDate;
            }

            // URL parametrelerini oluştur
            const params = new URLSearchParams({
              page: page.toString(),
              limit: limit.toString(),
              ...filter,
            });

            const response = await fetch(
              `${
                process.env.BASE_URL
              }/warehouses/receipts?${params.toString()}`,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                },
                credentials: "include",
              }
            );

            if (!response.ok) {
              throw new Error("Failed to fetch receipts");
            }

            const result = await response.json();
            setReceipts(result.data);
            setTotalCount(result.total);
            setError(null);

            return {
              data: result.data,
              totalCount: result.total,
            };
          } catch (err) {
            setError(
              err instanceof Error
                ? err.message
                : "An error occurred while fetching data"
            );
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to fetch receipts. Please try again.",
            });
            return {
              data: [],
              totalCount: 0,
            };
          } finally {
            setLoading(false);
          }
        },
      },
    }),
    [toast]
  );

  const handleRowDblClick = useCallback((e: any) => {
    setSelectedReceiptId(e.data.id);
    setDetailDialogOpen(true);
  }, []);

  const handleConvertToInvoice = useCallback(async () => {
    if (selectedRowKeys.length === 0) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Lütfen en az bir fiş seçin",
      });
      return;
    }

    // Seçili fişleri al
    const selectedReceipts = receipts.filter((receipt) =>
      selectedRowKeys.includes(receipt.id)
    );

    // Seçili fiş kontrolü
    if (selectedReceipts.length === 0) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Seçili fiş bulunamadı",
      });
      return;
    }

    // Cari ve fiş tipi kontrolü
    const firstReceipt = selectedReceipts[0];

    // Fiş tipi kontrolü
    if (!firstReceipt.receiptType) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Fiş tipi bulunamadı",
      });
      return;
    }

    const hasDifferentCurrents = selectedReceipts.some(
      (receipt) => receipt.currentId !== firstReceipt.currentId
    );

    // Fiş tipi kontrolü - Giris veya Cikis olmalı
    const hasDifferentTypes = selectedReceipts.some(
      (receipt) => receipt?.receiptType !== firstReceipt.receiptType
    );

    // Geçersiz fiş tipi kontrolü
    const hasInvalidType = !["Giris", "Cikis"].includes(
      firstReceipt.receiptType
    );

    if (hasDifferentCurrents) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Lütfen aynı cariye ait fişleri seçiniz",
      });
      return;
    }

    if (hasDifferentTypes) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Lütfen aynı tipteki fişleri seçiniz (Giriş veya Çıkış)",
      });
      return;
    }

    if (hasInvalidType) {
      toast({
        variant: "destructive",
        title: "Hata",
        description:
          "Geçersiz fiş tipi. Sadece Giriş veya Çıkış fişleri faturalaştırılabilir",
      });
      return;
    }

    try {
      setLoading(true);

      // Seçili fiş ID'lerini hazırla
      const receiptIds = selectedReceipts
        .filter((receipt) => receipt && receipt.id)
        .map((receipt) => receipt.id);

      if (receiptIds.length === 0) {
        throw new Error("Geçerli fiş ID'si bulunamadı");
      }

      const response = await fetch(
        `${process.env.BASE_URL}/warehouses/receipt/toInvoice`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          credentials: "include",
          body: JSON.stringify(receiptIds),
        }
      );

      if (!response.ok) {
        throw new Error("Fişler faturalaştırılırken bir hata oluştu");
      }

      toast({
        title: "Başarılı",
        description: "Seçili fişler başarıyla faturalaştırıldı",
      });

      // Listeyi yenile
      dataSource.store.load({ skip: 0, take: 20 });
      // Seçimleri temizle
      setSelectedRowKeys([]);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description:
          error instanceof Error
            ? error.message
            : "Fişler faturalaştırılamadı. Lütfen seçiminizi kontrol edip tekrar deneyin.",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedRowKeys, receipts, toast, dataSource]);

  // İlk yükleme için useEffect
  useEffect(() => {
    dataSource.store.load({ skip: 0, take: 20, isInitialLoad: true });
  }, [dataSource.store]);

  // Debug için useEffect - gerekirse kaldırılabilir
  useEffect(() => {
    if (receipts.length > 0) {
      console.log("Current receipts state:", {
        receiptsLength: receipts.length,
        firstReceipt: receipts[0],
        loading,
        error,
      });
    }
  }, [receipts, loading, error]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading receipts...</span>
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
    <div>
      <div className="p-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleConvertToInvoice}
          disabled={selectedRowKeys.length === 0}
          className="bg-[#84CC16] hover:bg-[#65A30D] text-white"
        >
          <FileText className="h-4 w-4 mr-2" />
          Seçili Fişleri Faturalaştır ({selectedRowKeys.length})
        </Button>
      </div>

      <DataGrid
        dataSource={dataSource}
        remoteOperations={{
          paging: true,
          filtering: true,
          sorting: false,
          grouping: false,
          summary: false,
          groupPaging: false,
        }}
        showBorders={true}
        showRowLines={true}
        showColumnLines={true}
        rowAlternationEnabled={true}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnResizingMode="widget"
        columnAutoWidth={true}
        wordWrapEnabled={true}
        onRowDblClick={handleRowDblClick}
        height="calc(100vh - 300px)"
        selectedRowKeys={selectedRowKeys}
        onSelectionChanged={(e) => setSelectedRowKeys(e.selectedRowKeys)}
      >
        <StateStoring
          enabled={true}
          type="localStorage"
          storageKey="receiptListGrid"
        />
        <LoadPanel enabled={true} />
        <Selection mode="multiple" showCheckBoxesMode="always" />
        <FilterRow visible={true} />
        <HeaderFilter visible={true} />
        <GroupPanel visible={true} />
        <Grouping autoExpandAll={false} />
        <ColumnChooser enabled={true} mode="select" />
        <ColumnFixing enabled={true} />
        <Scrolling mode="virtual" />
        <Paging defaultPageSize={20} />
        <SearchPanel visible={true} width={240} placeholder="Ara..." />

        <Column dataField="documentNo" caption="Fiş No" />
        <Column dataField="receiptType" caption="Fiş Tipi">
          <Lookup dataSource={receiptTypes} valueExpr="id" displayExpr="name" />
        </Column>
        <Column
          dataField="receiptDate"
          caption="Fiş Tarihi"
          dataType="datetime"
          format="dd.MM.yyyy HH:mm"
        />
        <Column dataField="current.currentCode" caption="Cari Kodu" />
        <Column dataField="current.currentName" caption="Cari Adı" />
        <Column dataField="branchCode" caption="Şube Kodu" />
        <Column dataField="description" caption="Açıklama" />
        <Column dataField="isTransfer" caption="Transfer" dataType="boolean" />
        <Column dataField="outWarehouse" caption="Çıkış Deposu" />
        <Column dataField="inWarehouse" caption="Giriş Deposu" />
        <Column dataField="createdBy" caption="Oluşturan" />
        <Column
          dataField="createdAt"
          caption="Oluşturma Tarihi"
          dataType="datetime"
          format="dd.MM.yyyy HH:mm"
        />

        <Toolbar>
          <Item name="groupPanel" />
          <Item name="searchPanel" />
          <Item name="columnChooserButton" />
        </Toolbar>
      </DataGrid>
      <ReceiptDetailDialog
        receiptId={selectedReceiptId}
        isOpen={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
      />
    </div>
  );
};

export default ReceiptListGrid;
