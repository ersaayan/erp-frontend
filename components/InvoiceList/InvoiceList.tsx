"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import DataGrid, {
  Column,
  Selection,
  FilterRow,
  HeaderFilter,
  Scrolling,
  Paging,
  StateStoring,
  Lookup,
  LoadPanel,
  Export,
} from "devextreme-react/data-grid";
import { Button } from "@/components/ui/button";
import { CheckSquare, RefreshCw, Settings, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "../ui/card";
import {
  Invoice,
  InvoiceListProps,
  InvoiceListResponse,
  FilterParams,
} from "./types";

const invoiceTypes = [
  { id: "Sales", name: "Satış Faturası" },
  { id: "Purchase", name: "Alış Faturası" },
  { id: "Return", name: "İade Faturası" },
  { id: "Cancel", name: "İptal Faturası" },
];

const documentTypes = [
  { id: "Invoice", name: "Fatura" },
  { id: "Order", name: "Sipariş" },
  { id: "Waybill", name: "İrsaliye" },
];

const InvoiceList: React.FC<InvoiceListProps> = ({ onMenuItemClick }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const dataGridRef = useRef<DataGrid>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [bulkActionsOpen, setBulkActionsOpen] = useState(false);
  const [activeInvoiceTab, setActiveInvoiceTab] = useState("all");

  const [settings, setSettings] = useState({
    showFilterRow: true,
    showHeaderFilter: true,
    alternateRowColoring: true,
  });

  const fetchInvoices = useCallback(
    async (params: FilterParams = {}) => {
      setLoading(true);
      try {
        // API parametrelerini oluştur
        const apiParams: any = {
          page: params.page || 1,
          limit: params.limit || pageSize,
        };

        // Sıralama varsa ekle
        if (params.orderBy) {
          apiParams.orderBy = params.orderBy;
        } else {
          // Varsayılan sıralama
          apiParams.orderBy = {
            field: "invoiceDate",
            direction: "desc",
          };
        }

        // Filtreleme
        const filter: any = {
          ...params.filter,
        };

        // Aktif sekmeye göre filtreleme
        if (activeInvoiceTab !== "all") {
          filter.invoiceType =
            activeInvoiceTab === "purchase" ? "Purchase" : "Sales";
        }

        // Filtre varsa ekle
        if (Object.keys(filter).length > 0) {
          apiParams.filter = filter;
        }

        const response = await fetch(
          `${process.env.BASE_URL}/invoices?${new URLSearchParams({
            page: apiParams.page.toString(),
            limit: apiParams.limit.toString(),
            orderBy: JSON.stringify(apiParams.orderBy),
            ...(apiParams.filter && {
              filter: JSON.stringify(apiParams.filter),
            }),
          })}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Faturalar yüklenirken bir hata oluştu");
        }

        const result: InvoiceListResponse = await response.json();
        setInvoices(result.data);
        setCurrentPage(result.page);
      } catch (_error) {
        toast({
          variant: "destructive",
          title: "Hata",
          description:
            _error instanceof Error
              ? _error.message
              : "Faturalar yüklenirken bir hata oluştu",
        });
      } finally {
        setLoading(false);
      }
    },
    [toast, activeInvoiceTab, pageSize]
  );

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices, activeInvoiceTab]);

  const handlePageChange = useCallback(
    (page: number) => {
      fetchInvoices({ page, limit: pageSize });
    },
    [fetchInvoices, pageSize]
  );

  const handlePageSizeChange = useCallback(
    (size: number) => {
      setPageSize(size);
      fetchInvoices({ page: 1, limit: size });
    },
    [fetchInvoices]
  );

  const handleRefresh = useCallback(() => {
    fetchInvoices({ page: currentPage, limit: pageSize });
  }, [fetchInvoices, currentPage, pageSize]);

  const handleRowDblClick = useCallback(
    async (e: any) => {
      try {
        const response = await fetch(
          `${process.env.BASE_URL}/invoices/getInvoiceInfoById/${e.data.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Fatura detayları alınamadı");
        }

        const invoiceDetail = await response.json();
        localStorage.setItem(
          "currentInvoiceData",
          JSON.stringify(invoiceDetail)
        );

        if (e.data.documentType === "Invoice") {
          onMenuItemClick(
            e.data.invoiceType === "Purchase"
              ? "Alış Faturası"
              : "Satış Faturası"
          );
        } else if (e.data.documentType === "Order") {
          onMenuItemClick("Hızlı Satış");
        }

        toast({
          title: "Bilgi",
          description:
            e.data.invoiceType === "Cancel"
              ? "İptal Faturaları Düzenlenemez"
              : "Fatura Açılıyor...",
        });
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Fatura açılırken bir hata oluştu",
        });
      }
    },
    [onMenuItemClick, toast]
  );

  const handleCancelInvoices = useCallback(async () => {
    if (selectedRowKeys.length === 0) return;

    try {
      setLoading(true);

      // Seçili faturaları bul
      const selectedInvoices = invoices.filter((invoice) =>
        selectedRowKeys.includes(invoice.id)
      );

      // Faturaları tiplerine göre grupla
      const purchaseInvoices = selectedInvoices
        .filter((invoice) => invoice.invoiceType === "Purchase")
        .map((invoice) => invoice.id);

      const salesInvoices = selectedInvoices
        .filter((invoice) => invoice.invoiceType === "Sales")
        .map((invoice) => invoice.id);

      // Her tip için ayrı istek gönder
      const requests = [];

      if (purchaseInvoices.length > 0) {
        requests.push(
          fetch(`${process.env.BASE_URL}/invoices/purchase/cancel`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
            credentials: "include",
            body: JSON.stringify(purchaseInvoices),
          })
        );
      }

      if (salesInvoices.length > 0) {
        requests.push(
          fetch(`${process.env.BASE_URL}/invoices/sales/cancel`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
            credentials: "include",
            body: JSON.stringify(salesInvoices),
          })
        );
      }

      // Tüm istekleri paralel olarak çalıştır
      const responses = await Promise.all(requests);

      // Hata kontrolü
      for (const response of responses) {
        if (!response.ok) {
          throw new Error("Faturalar iptal edilirken bir hata oluştu");
        }
      }

      toast({
        title: "Başarılı",
        description: "Seçili faturalar başarıyla iptal edildi",
      });

      handleRefresh();
      setSelectedRowKeys([]);
      setBulkActionsOpen(false);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Hata",
        description:
          error instanceof Error ? error.message : "Faturalar iptal edilemedi",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedRowKeys, invoices, toast, handleRefresh]);

  return (
    <div className="p-4 space-y-4">
      {/* Toolbar */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Yenile
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Ayarlar
          </Button>
          <select
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            value={activeInvoiceTab}
            onChange={(e) => setActiveInvoiceTab(e.target.value)}
          >
            <option value="all">Tüm Faturalar</option>
            <option value="purchase">Alış Faturaları</option>
            <option value="sales">Satış Faturaları</option>
          </select>
        </div>

        <Button
          variant={bulkActionsOpen ? "secondary" : "outline"}
          size="sm"
          onClick={() => setBulkActionsOpen(!bulkActionsOpen)}
          disabled={selectedRowKeys.length === 0}
        >
          <CheckSquare className="h-4 w-4 mr-2" />
          Toplu İşlemler ({selectedRowKeys.length})
        </Button>
      </div>

      {/* Bulk Actions */}
      {bulkActionsOpen && (
        <Card className="p-4">
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleCancelInvoices}
              disabled={selectedRowKeys.length === 0}
            >
              <FileText className="h-4 w-4 mr-2" />
              Seçili Faturaları İptal Et
            </Button>
          </div>
        </Card>
      )}

      {/* DataGrid */}
      <DataGrid
        ref={dataGridRef}
        dataSource={invoices}
        showBorders={true}
        showRowLines={true}
        showColumnLines={true}
        rowAlternationEnabled={settings.alternateRowColoring}
        columnAutoWidth={true}
        wordWrapEnabled={true}
        height="calc(100vh - 300px)"
        selectedRowKeys={selectedRowKeys}
        onSelectionChanged={(e) => setSelectedRowKeys(e.selectedRowKeys)}
        onRowDblClick={handleRowDblClick}
        onFilterValueChange={(e) => {
          const filter: any = {};
          e.columns.forEach((column: any) => {
            if (column.filterValue) {
              switch (column.dataField) {
                case "invoiceType":
                case "documentType":
                case "current.currentCode":
                case "current.currentName":
                  filter[column.dataField] = column.filterValue;
                  break;
                default:
                  break;
              }
            }
          });
          fetchInvoices({ filter });
        }}
      >
        <LoadPanel enabled={loading} />
        <StateStoring
          enabled={true}
          type="localStorage"
          storageKey="invoiceListGrid"
        />
        <Selection mode="multiple" showCheckBoxesMode="always" />
        <FilterRow visible={settings.showFilterRow} />
        <HeaderFilter visible={settings.showHeaderFilter} />
        <Scrolling mode="virtual" rowRenderingMode="virtual" />
        <Paging
          enabled={true}
          pageSize={pageSize}
          defaultCurrentPage={currentPage}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
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
          dataField="invoiceNo"
          caption="Fatura No"
          width={120}
          allowFiltering={false}
        />
        <Column
          dataField="gibInvoiceNo"
          caption="GİB No"
          width={120}
          allowFiltering={false}
        />
        <Column
          dataField="invoiceDate"
          caption="Fatura Tarihi"
          dataType="datetime"
          format="dd.MM.yyyy HH:mm"
          width={150}
          allowFiltering={false}
        />
        <Column
          dataField="invoiceType"
          caption="Fatura Tipi"
          allowFiltering={true}
        >
          <Lookup dataSource={invoiceTypes} valueExpr="id" displayExpr="name" />
        </Column>
        <Column
          dataField="documentType"
          caption="Belge Tipi"
          allowFiltering={true}
        >
          <Lookup
            dataSource={documentTypes}
            valueExpr="id"
            displayExpr="name"
          />
        </Column>
        <Column
          dataField="current.currentCode"
          caption="Cari Kodu"
          allowFiltering={true}
        />
        <Column
          dataField="current.currentName"
          caption="Cari Adı"
          allowFiltering={true}
        />
        <Column
          dataField="branch.branchCode"
          caption="Şube Kodu"
          allowFiltering={false}
        />
        <Column
          dataField="branch.branchName"
          caption="Şube Adı"
          allowFiltering={false}
        />
        <Column
          dataField="totalAmount"
          caption="Toplam Tutar"
          dataType="number"
          format="#,##0.00"
          allowFiltering={false}
        />
        <Column
          dataField="totalVat"
          caption="KDV"
          dataType="number"
          format="#,##0.00"
          allowFiltering={false}
        />
        <Column
          dataField="totalDiscount"
          caption="İndirim"
          dataType="number"
          format="#,##0.00"
          allowFiltering={false}
        />
        <Column
          dataField="totalNet"
          caption="Net Tutar"
          dataType="number"
          format="#,##0.00"
          allowFiltering={false}
        />
        <Column
          dataField="totalPaid"
          caption="Ödenen"
          dataType="number"
          format="#,##0.00"
          allowFiltering={false}
        />
        <Column
          dataField="totalDebt"
          caption="Borç"
          dataType="number"
          format="#,##0.00"
          allowFiltering={false}
        />
        <Column
          dataField="createdByUser.username"
          caption="Oluşturan"
          allowFiltering={false}
        />
        <Column
          dataField="createdAt"
          caption="Oluşturma Tarihi"
          dataType="datetime"
          format="dd.MM.yyyy HH:mm"
          allowFiltering={false}
        />
      </DataGrid>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tablo Ayarları</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Filtre Satırı</Label>
              <Switch
                checked={settings.showFilterRow}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, showFilterRow: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Başlık Filtresi</Label>
              <Switch
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
              <Label>Alternatif Satır Renklendirme</Label>
              <Switch
                checked={settings.alternateRowColoring}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({
                    ...prev,
                    alternateRowColoring: checked,
                  }))
                }
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoiceList;
