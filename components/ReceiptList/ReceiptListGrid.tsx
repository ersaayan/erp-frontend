/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useCallback, useState, useRef, useEffect } from "react";
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
  Pager,
} from "devextreme-react/data-grid";
import CustomStore from "devextreme/data/custom_store";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, FileText, RefreshCw } from "lucide-react";
import { Receipt } from "./types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import ReceiptDetailDialog from "./ReceiptDetailDialog";

const receiptTypes = [
  { id: "Giris", name: "Giriş Fişi" },
  { id: "Cikis", name: "Çıkış Fişi" },
];

const allowedPageSizes = [10, 20, 50, 100];

// API'den veri çekme fonksiyonu
const fetchGridData = async (options: any) => {
  const page = options.skip ? Math.floor(options.skip / options.take) + 1 : 1;
  const limit = options.take || 20;

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  // Filtreleme işlemleri
  if (options.filter) {
    const processFilter = (filter: any) => {
      if (Array.isArray(filter[0])) {
        filter.forEach((f: any) => processFilter(f));
        return;
      }

      const [field, op, value] = filter;

      // Nested field'ları düzelt
      const normalizedField = field.replace("current.", "");

      if (op === "contains") {
        params.append(normalizedField, value);
      } else if (op === "=") {
        params.append(normalizedField, value);
      } else if (op === ">=") {
        params.append(`${normalizedField}From`, value);
      } else if (op === "<=") {
        params.append(`${normalizedField}To`, value);
      }
    };

    processFilter(options.filter);
  }

  // Arama paneli için
  if (options.searchValue) {
    params.append("search", options.searchValue);
  }

  const response = await fetch(
    `${process.env.BASE_URL}/warehouses/receipts?${params.toString()}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Fişler yüklenirken bir hata oluştu");
  }

  const result = await response.json();
  return {
    data: result.data,
    totalCount: result.total,
  };
};

// CustomStore instance'ı
const customDataSource = new CustomStore({
  key: "id",
  load: fetchGridData,
});

const ReceiptListGrid: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(
    null
  );
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const gridRef = useRef<any>(null);

  // Loading state'ini yönetmek için
  const handleDataLoading = useCallback((e: any) => {
    setLoading(e.component.isLoading());
  }, []);

  // Hata durumunu yönetmek için
  const handleDataLoadError = useCallback((e: any) => {
    setError(e.message);
  }, []);

  // Satıra çift tıklama işlemi
  const handleRowDblClick = useCallback((e: any) => {
    setSelectedReceiptId(e.data.id);
    setDetailDialogOpen(true);
  }, []);

  // Fişleri faturalaştırma işlemi
  const handleConvertToInvoice = useCallback(async () => {
    if (selectedRowKeys.length === 0) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Lütfen en az bir fiş seçin",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.BASE_URL}/warehouses/receipt/toInvoice`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          credentials: "include",
          body: JSON.stringify(selectedRowKeys),
        }
      );

      if (!response.ok) {
        throw new Error("Fişler faturalaştırılırken bir hata oluştu");
      }

      toast({
        title: "Başarılı",
        description: "Seçili fişler başarıyla faturalaştırıldı",
      });

      // Grid'i yenile ve seçimleri temizle
      if (gridRef.current) {
        gridRef.current.instance.refresh();
      }
      setSelectedRowKeys([]);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description:
          error instanceof Error ? error.message : "Fişler faturalaştırılamadı",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedRowKeys, toast]);

  // Grid'i yenileme işlemi
  const handleRefresh = useCallback(() => {
    if (gridRef.current) {
      gridRef.current.instance.refresh();
    }
  }, []);

  // Filtreleri temizleme işlemi
  const handleClearFilters = useCallback(() => {
    if (gridRef.current) {
      const instance = gridRef.current.instance;
      instance.clearFilter();
      instance.searchByText("");
      instance.refresh();
    }
  }, []);

  // Hata durumunda alert göster
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
      {/* Toolbar */}
      <div className="p-4 flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleConvertToInvoice}
            disabled={selectedRowKeys.length === 0 || loading}
            className="bg-[#84CC16] hover:bg-[#65A30D] text-white"
          >
            <FileText className="h-4 w-4 mr-2" />
            Seçili Fişleri Faturalaştır ({selectedRowKeys.length})
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Filtreleri Temizle
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Yenile
        </Button>
      </div>

      {/* DataGrid */}
      <DataGrid
        ref={gridRef}
        dataSource={customDataSource}
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
        onDataErrorOccurred={handleDataLoadError}
        onContentReady={handleDataLoading}
      >
        <StateStoring
          enabled={true}
          type="localStorage"
          storageKey="receiptListGrid"
        />
        <LoadPanel enabled={loading} />
        <Selection mode="multiple" showCheckBoxesMode="always" />
        <FilterRow visible={true} />
        <HeaderFilter visible={true} />
        <GroupPanel visible={true} />
        <Grouping autoExpandAll={false} />
        <ColumnChooser enabled={true} mode="select" />
        <ColumnFixing enabled={true} />
        <Scrolling mode="standard" />
        <Paging defaultPageSize={20} />
        <Pager
          visible={true}
          allowedPageSizes={allowedPageSizes}
          displayMode="compact"
          showPageSizeSelector={true}
          showInfo={true}
          showNavigationButtons={true}
        />
        <SearchPanel visible={true} width={240} placeholder="Ara..." />

        <Column dataField="documentNo" caption="Fiş No" />
        <Column dataField="receiptType" caption="Fiş Tipi">
          <Lookup dataSource={receiptTypes} valueExpr="id" displayExpr="name" />
        </Column>
        <Column
          dataField="createdAt"
          caption="Fiş Tarihi"
          dataType="datetime"
          format="dd.MM.yyyy HH:mm"
        />
        <Column dataField="current.currentCode" caption="Cari Kodu" />
        <Column dataField="current.currentName" caption="Cari Adı" />
        <Column dataField="branchCode" caption="Şube Kodu" />
        <Column dataField="description" caption="Açıklama" />
        <Column dataField="createdByUser.username" caption="Oluşturan" />

        <Toolbar>
          <Item name="groupPanel" />
          <Item name="searchPanel" />
          <Item name="columnChooserButton" />
        </Toolbar>
      </DataGrid>

      {/* Detay Dialog */}
      <ReceiptDetailDialog
        receiptId={selectedReceiptId}
        isOpen={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
      />
    </div>
  );
};

export default ReceiptListGrid;
