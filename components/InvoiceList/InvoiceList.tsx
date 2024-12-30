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
import { RowPreparedEvent } from "devextreme/ui/data_grid";
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
  RefreshCw,
  Settings,
  Upload,
} from "lucide-react";
import { Invoice } from "./types";
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
import { InvoiceDetailResponse } from "@/types/invoice-detail";
import { Card } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface InvoiceListProps {
  onMenuItemClick: (itemName: string) => void;
}

const InvoiceList: React.FC<InvoiceListProps> = ({ onMenuItemClick }) => {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dataGridRef = useRef<DataGrid>(null);
  const [quickFilterText, setQuickFilterText] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bulkActionsOpen, setBulkActionsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Invoice");
  const [activeInvoiceTab, setActiveInvoiceTab] = useState("all");

  const [settings, setSettings] = useState({
    showGroupPanel: true,
    showFilterRow: true,
    showHeaderFilter: true,
    alternateRowColoring: true,
    pageSize: "50",
    virtualScrolling: true,
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.BASE_URL}/invoices/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch invoice data");
      }

      const data = await response.json();
      setInvoices(data);
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
        description: "Failed to fetch invoice data. Please try again.",
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
        // Fatura detaylarını getir
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
          throw new Error("Failed to fetch invoice details");
        }

        const invoiceDetail: InvoiceDetailResponse = await response.json();

        // Veriyi localStorage'a kaydet
        localStorage.setItem(
          "currentInvoiceData",
          JSON.stringify(invoiceDetail)
        );

        // Belge tipine göre yönlendirme yap
        if (e.data.documentType === "Invoice") {
          if (e.data.invoiceType === "Purchase") {
            onMenuItemClick("Alış Faturası");
          } else if (e.data.invoiceType === "Sales") {
            onMenuItemClick("Satış Faturası");
          }
        } else if (e.data.documentType === "Order") {
          // Sipariş düzenleme sayfasına yönlendir
          onMenuItemClick("Hızlı Satış");
        }

        toast({
          title: "Success",
          description:
            e.data.documentType === "Order"
              ? "Opening order for editing..."
              : "Opening invoice form...",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to open document. Please try again.",
        });
        console.error(error);
      }
    },
    [onMenuItemClick, toast]
  );

  const onExporting = React.useCallback((e: any) => {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Invoices");

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
          "Invoices.xlsx"
        );
      });
    });
  }, []);

  const applyQuickFilter = useCallback(() => {
    if (!dataGridRef.current) return;

    const instance = dataGridRef.current.instance;
    if (quickFilterText) {
      instance.filter([
        ["invoiceNo", "contains", quickFilterText],
        "or",
        ["gibInvoiceNo", "contains", quickFilterText],
        "or",
        ["currentCode", "contains", quickFilterText],
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
        throw error;
      } finally {
        setLoading(false);
        if (event.target) {
          event.target.value = "";
        }
      }
    },
    [toast]
  );

  const onRowPrepared = useCallback((e: RowPreparedEvent<any, any>) => {
    if (e.rowType === "data") {
      switch (e.data.invoiceType) {
        case "Return":
          e.rowElement.classList.add("bg-light-red");
          break;
        default:
          e.rowElement.classList.remove(
            "bg-light-blue",
            "bg-light-green",
            "bg-light-red"
          );
          break;
      }
    }
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

  const handleCancelInvoices = async () => {
    if (selectedRowKeys.length === 0) return;

    try {
      setLoading(true);
      console.log("Selected Row Keys:", selectedRowKeys);

      const selectedInvoices = invoices.filter((invoice) =>
        selectedRowKeys.includes(invoice.id)
      );
      console.log("Selected Invoices:", selectedInvoices);

      const invoicePayloads = selectedInvoices.map((invoice) => {
        const payload = {
          id: invoice.id,
          invoiceNo: invoice.invoiceNo,
        };
        return payload;
      });

      console.log("Invoice Payloads:", invoicePayloads);

      const endpoint =
        activeInvoiceTab === "purchase" ? "/purchase/cancel" : "/sales/cancel";

      const requestBody = invoicePayloads;
      console.log("Request Body:", JSON.stringify(requestBody, null, 2));

      const response = await fetch(
        `${process.env.BASE_URL}/invoices${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          credentials: "include",
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error("Faturalar iptal edilirken bir hata oluştu");
      }

      toast({
        title: "Başarılı",
        description: "Seçili faturalar başarıyla iptal edildi",
        variant: "success",
      });

      // Listeyi yenile
      fetchData();
      // Seçimleri temizle
      setSelectedRowKeys([]);
      setBulkActionsOpen(false);
    } catch (error) {
      console.error("Error canceling invoices:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description:
          error instanceof Error ? error.message : "Faturalar iptal edilemedi",
      });
    } finally {
      setLoading(false);
    }
  };

  const getFilteredInvoices = useCallback(
    (documentType: string) => {
      let filtered = invoices.filter(
        (invoice) => invoice.documentType === documentType
      );

      if (documentType === "Invoice") {
        switch (activeInvoiceTab) {
          case "purchase":
            filtered = filtered.filter(
              (invoice) => invoice.invoiceType === "Purchase"
            );
            break;
          case "sales":
            filtered = filtered.filter(
              (invoice) => invoice.invoiceType === "Sales"
            );
            break;
          // 'all' durumunda filtreleme yapma
        }
      }

      return filtered;
    },
    [invoices, activeInvoiceTab]
  );

  const renderDataGrid = (documentType: string) => (
    <DataGrid
      ref={dataGridRef}
      dataSource={getFilteredInvoices(documentType)}
      showBorders={true}
      showRowLines={true}
      showColumnLines={true}
      rowAlternationEnabled={settings.alternateRowColoring}
      allowColumnReordering={true}
      allowColumnResizing={true}
      columnAutoWidth={true}
      wordWrapEnabled={true}
      onExporting={onExporting}
      height="calc(100vh - 300px)"
      selectedRowKeys={selectedRowKeys}
      onSelectionChanged={(e) =>
        setSelectedRowKeys(e.selectedRowKeys as string[])
      }
      onRowDblClick={handleRowDblClick}
      onRowPrepared={onRowPrepared}
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
        storageKey={`invoiceListGrid_${documentType}`}
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
        columnRenderingMode={settings.virtualScrolling ? "virtual" : "standard"}
      />
      <Paging enabled={true} pageSize={parseInt(settings.pageSize)} />
      <Export enabled={true} allowExportSelectedData={true} />
      <ColumnChooser enabled={true} mode="select" />

      <Column dataField="invoiceNo" caption="Fatura No" width={120} />
      <Column dataField="gibInvoiceNo" caption="GİB No" width={120} />
      <Column
        dataField="invoiceDate"
        caption="Fatura Tarihi"
        dataType="datetime"
        format="dd.MM.yyyy HH:mm"
        width={150}
      />
      <Column dataField="invoiceType" caption="Fatura Tipi" width={100} />
      <Column dataField="documentType" caption="Belge Tipi" width={100} />
      <Column dataField="currentCode" caption="Cari Kodu" width={100} />
      <Column dataField="description" caption="Açıklama" />
      <Column
        dataField="totalAmount"
        caption="Toplam Tutar"
        dataType="number"
        format="#,##0.00"
        width={120}
      />
      <Column
        dataField="totalVat"
        caption="KDV"
        dataType="number"
        format="#,##0.00"
        width={100}
      />
      <Column
        dataField="totalDiscount"
        caption="İndirim"
        dataType="number"
        format="#,##0.00"
        width={100}
      />
      <Column
        dataField="totalNet"
        caption="Net Tutar"
        dataType="number"
        format="#,##0.00"
        width={120}
      />
      <Column
        dataField="totalPaid"
        caption="Ödenen"
        dataType="number"
        format="#,##0.00"
        width={120}
      />
      <Column
        dataField="totalDebt"
        caption="Borç"
        dataType="number"
        format="#,##0.00"
        width={120}
      />
      <Column
        dataField="paymentDate"
        caption="Ödeme Tarihi"
        dataType="datetime"
        format="dd.MM.yyyy HH:mm"
        width={150}
      />
      <Column dataField="paymentDay" caption="Vade (Gün)" width={100} />

      <Summary>
        <TotalItem
          column="totalAmount"
          summaryType="sum"
          valueFormat="#,##0.00"
        />
        <TotalItem column="totalVat" summaryType="sum" valueFormat="#,##0.00" />
        <TotalItem
          column="totalDiscount"
          summaryType="sum"
          valueFormat="#,##0.00"
        />
        <TotalItem column="totalNet" summaryType="sum" valueFormat="#,##0.00" />
        <TotalItem
          column="totalPaid"
          summaryType="sum"
          valueFormat="#,##0.00"
        />
        <TotalItem
          column="totalDebt"
          summaryType="sum"
          valueFormat="#,##0.00"
        />
      </Summary>

      <Toolbar>
        <Item name="groupPanel" />
        <Item name="exportButton" />
        <Item name="columnChooserButton" />
      </Toolbar>
    </DataGrid>
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

      {bulkActionsOpen && activeInvoiceTab !== "all" && (
        <Card className="p-4 rounded-md flex items-center">
          <Button
            variant="destructive"
            onClick={handleCancelInvoices}
            disabled={selectedRowKeys.length === 0}
          >
            Seçili Olanları İptal Et ({selectedRowKeys.length})
          </Button>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="Invoice">Faturalar</TabsTrigger>
          <TabsTrigger value="Order">Siparişler</TabsTrigger>
          <TabsTrigger value="Waybill">İrsaliyeler</TabsTrigger>
          <TabsTrigger value="Other">Diğer</TabsTrigger>
        </TabsList>

        <TabsContent value="Invoice" className="mt-4">
          <Tabs value={activeInvoiceTab} onValueChange={setActiveInvoiceTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">Tüm Faturalar</TabsTrigger>
              <TabsTrigger value="purchase">Alış Faturaları</TabsTrigger>
              <TabsTrigger value="sales">Satış Faturaları</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              {renderDataGrid("Invoice")}
            </TabsContent>
            <TabsContent value="purchase" className="mt-4">
              {renderDataGrid("Invoice")}
            </TabsContent>
            <TabsContent value="sales" className="mt-4">
              {renderDataGrid("Invoice")}
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="Order" className="mt-4">
          {renderDataGrid("Order")}
        </TabsContent>
        <TabsContent value="Waybill" className="mt-4">
          {renderDataGrid("Waybill")}
        </TabsContent>
        <TabsContent value="Other" className="mt-4">
          {renderDataGrid("Other")}
        </TabsContent>
      </Tabs>

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

export default InvoiceList;
