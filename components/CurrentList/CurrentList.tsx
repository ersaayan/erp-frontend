/* eslint-disable react/no-children-prop */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
  ColumnChooser,
  Toolbar,
  Item,
  Paging,
  StateStoring,
  MasterDetail,
  Lookup,
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
  RefreshCw,
  Settings,
  Upload,
} from "lucide-react";
import { Current } from "./types";
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
import { currentTypes, institutionTypes } from "./data";
import CurrentDetailView from "./CurrentDetailView";
import { Card } from "../ui/card";

interface CurrentListProps {
  onMenuItemClick: (itemName: string) => void;
}

const CurrentList: React.FC<CurrentListProps> = ({ onMenuItemClick }) => {
  const { toast } = useToast();
  const [currentData, setCurrentData] = useState<Current[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dataGridRef = useRef<DataGrid>(null);
  const [quickFilterText, setQuickFilterText] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bulkActionsOpen, setBulkActionsOpen] = useState(false);

  const [settings, setSettings] = useState({
    showGroupPanel: true,
    showFilterRow: true,
    showHeaderFilter: true,
    alternateRowColoring: true,
    pageSize: "50",
    virtualScrolling: true,
  });

  const handleRowDblClick = useCallback(
    async (e: any) => {
      try {
        const response = await fetch(
          `${process.env.BASE_URL}/currents/${e.data.id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch current details");
        }

        const currentData = await response.json();

        // Veriyi form yapısına uygun şekilde dönüştür
        const formattedData = {
          id: currentData.id,
          currentCode: currentData.currentCode,
          currentName: currentData.currentName,
          currentType: currentData.currentType,
          institution: currentData.institution,
          identityNo: currentData.identityNo,
          taxNumber: currentData.taxNumber,
          taxOffice: currentData.taxOffice,
          kepAddress: currentData.kepAddress || "",
          mersisNo: currentData.mersisNo || "",
          sicilNo: currentData.sicilNo || "",
          title: currentData.title || "",
          webSite: currentData.webSite || "",
          birthOfDate: currentData.birthOfDate
            ? new Date(currentData.birthOfDate)
            : null,
          priceListId: currentData.priceListId,
          categories:
            currentData.currentCategoryItem?.map((item) => item.categoryId) ||
            [],
          addresses:
            currentData.currentAddress?.map((addr) => ({
              id: addr.id,
              addressName: addr.addressName || "",
              addressType: addr.addressType || "",
              address: addr.address || "",
              province: addr.city || "",
              district: addr.district || "",
              countryCode: addr.countryCode || "",
              postalCode: addr.postalCode || "",
              phone: addr.phone || "",
              phone2: addr.phone2 || "",
              email: addr.email || "",
              email2: addr.email2 || "",
            })) || [],
        };

        // LocalStorage'a kaydet
        localStorage.setItem("currentFormData", JSON.stringify(formattedData));
        localStorage.setItem("current_form_edit_mode", "true");

        // Cari Formu sayfasına yönlendir
        onMenuItemClick("Cari Formu");

        toast({
          title: "Success",
          description: "Cari formu açılıyor...",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Cari detayları yüklenirken bir hata oluştu.",
        });
        console.error(error);
      }
    },
    [onMenuItemClick, toast]
  );

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.BASE_URL}/currents`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch current data");
      }

      const data = await response.json();
      setCurrentData(data);
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
        description: "Failed to fetch current data. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteSelected = useCallback(async () => {
    if (selectedRowKeys.length === 0) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Lütfen silmek için en az bir cari seçin.",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.BASE_URL}/currents/deleteMany`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          credentials: "include",
          body: JSON.stringify({ ids: selectedRowKeys }),
        }
      );

      if (!response.ok) {
        throw new Error("Silme işlemi başarısız oldu.");
      }

      toast({
        title: "Başarılı",
        description: "Seçili cariler başarıyla silindi.",
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

  const onExporting = React.useCallback(
    (e: any) => {
      const workbook = new Workbook();
      const mainSheet = workbook.addWorksheet("Cariler");
      const addressSheet = workbook.addWorksheet("Adresler");
      const financialSheet = workbook.addWorksheet("Finansal Bilgiler");
      const riskSheet = workbook.addWorksheet("Risk Bilgileri");
      const officialsSheet = workbook.addWorksheet("Yetkililer");

      // Ana sayfanın başlıklarını manuel olarak ekleyelim
      mainSheet.addRow([
        "Cari Kodu",
        "Cari Adı",
        "Cari Tipi",
        "Kurum Tipi",
        "Ünvan",
        "Vergi No",
        "Vergi Dairesi",
        "TC Kimlik No",
        "Web Sitesi",
        "KEP Adresi",
        "Mersis No",
        "Sicil No",
        "Oluşturma Tarihi",
        "Güncelleme Tarihi",
      ]);

      // Ana verileri ekleyelim
      currentData.forEach((current) => {
        mainSheet.addRow([
          current.currentCode,
          current.currentName,
          current.currentType,
          current.institution,
          current.title,
          current.taxNumber,
          current.taxOffice,
          current.identityNo,
          current.webSite || "",
          current.kepAddress || "",
          current.mersisNo || "",
          current.sicilNo || "",
          new Date(current.createdAt).toLocaleString("tr-TR"),
          new Date(current.updatedAt).toLocaleString("tr-TR"),
        ]);
      });

      // Adres detayları
      addressSheet.addRow([
        "Cari Kodu",
        "Cari Adı",
        "Adres Adı",
        "Adres Tipi",
        "Adres",
        "Ülke Kodu",
        "Şehir",
        "İlçe",
        "Posta Kodu",
        "Telefon",
        "Telefon 2",
        "E-posta",
        "E-posta 2",
      ]);

      currentData.forEach((current) => {
        current.currentAddress?.forEach((addr) => {
          addressSheet.addRow([
            current.currentCode,
            current.currentName,
            addr.addressName,
            addr.addressType,
            addr.address,
            addr.countryCode,
            addr.city,
            addr.district,
            addr.postalCode,
            addr.phone,
            addr.phone2,
            addr.email,
            addr.email2,
          ]);
        });
      });

      // Finansal detaylar
      financialSheet.addRow([
        "Cari Kodu",
        "Cari Adı",
        "Banka Adı",
        "Şube",
        "Şube Kodu",
        "IBAN",
        "Hesap No",
      ]);

      currentData.forEach((current) => {
        current.currentFinancial?.forEach((fin) => {
          financialSheet.addRow([
            current.currentCode,
            current.currentName,
            fin.bankName,
            fin.bankBranch,
            fin.bankBranchCode,
            fin.iban,
            fin.accountNo,
          ]);
        });
      });

      // Risk detayları
      riskSheet.addRow([
        "Cari Kodu",
        "Cari Adı",
        "Para Birimi",
        "Teminat Tutarı",
        "Açık Hesap Limiti",
        "Hesap Kesim Günü",
        "Vade (Gün)",
        "Gecikme Limit Günü",
        "Varsayılan Alış İskontosu",
        "Varsayılan Satış İskontosu",
        "Ekstre Gönder",
        "Limit Kontrol",
        "Açık Hesap",
        "POS Kullanım",
      ]);

      currentData.forEach((current) => {
        current.currentRisk?.forEach((risk) => {
          riskSheet.addRow([
            current.currentCode,
            current.currentName,
            risk.currency,
            risk.teminatYerelTutar,
            risk.acikHesapYerelLimit,
            risk.hesapKesimGunu,
            risk.vadeGun,
            risk.gecikmeLimitGunu,
            risk.varsayilanAlisIskontosu,
            risk.varsayilanSatisIskontosu,
            risk.ekstreGonder ? "Evet" : "Hayır",
            risk.limitKontrol ? "Evet" : "Hayır",
            risk.acikHesap ? "Evet" : "Hayır",
            risk.posKullanim ? "Evet" : "Hayır",
          ]);
        });
      });

      // Yetkili kişi detayları
      officialsSheet.addRow([
        "Cari Kodu",
        "Cari Adı",
        "Ünvan",
        "Ad",
        "Soyad",
        "Telefon",
        "E-posta",
        "Not",
      ]);

      currentData.forEach((current) => {
        current.currentOfficials?.forEach((official) => {
          officialsSheet.addRow([
            current.currentCode,
            current.currentName,
            official.title,
            official.name,
            official.surname,
            official.phone,
            official.email,
            official.note,
          ]);
        });
      });

      // Tüm sayfalar için sütun genişliklerini otomatik ayarla
      [
        mainSheet,
        addressSheet,
        financialSheet,
        riskSheet,
        officialsSheet,
      ].forEach((sheet) => {
        sheet.columns.forEach((column) => {
          let maxLength = 0;
          column.eachCell({ includeEmpty: true }, (cell) => {
            const columnLength = cell.value ? cell.value.toString().length : 10;
            if (columnLength > maxLength) {
              maxLength = columnLength;
            }
          });
          column.width = maxLength < 10 ? 10 : maxLength + 2;
        });
      });

      // Excel dosyasını kaydet
      workbook.xlsx.writeBuffer().then((buffer) => {
        saveAs(
          new Blob([buffer], { type: "application/octet-stream" }),
          "Cariler_Detayli.xlsx"
        );
      });
    },
    [currentData]
  );

  const applyQuickFilter = useCallback(() => {
    if (!dataGridRef.current) return;

    const instance = dataGridRef.current.instance;
    if (quickFilterText) {
      instance.filter([
        ["currentCode", "contains", quickFilterText],
        "or",
        ["currentName", "contains", quickFilterText],
        "or",
        ["title", "contains", quickFilterText],
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
          <Button variant="destructive" onClick={handleDeleteSelected}>
            Seçili Olanları Sil
          </Button>
        </Card>
      )}

      <DataGrid
        ref={dataGridRef}
        dataSource={currentData}
        onRowDblClick={handleRowDblClick}
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
        onSelectionChanged={(e) =>
          setSelectedRowKeys(e.selectedRowKeys as string[])
        }
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
          storageKey="currentListGrid"
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
        <Export
          enabled={true}
          allowExportSelectedData={true}
          children={true}
          texts={{
            exportAll: "Tüm Verileri Excel'e Aktar",
            exportSelectedRows: "Seçili Satırları Excel'e Aktar",
            exportTo: "Excel'e Aktar",
          }}
        />
        <ColumnChooser enabled={true} mode="select" />
        <MasterDetail
          enabled={true}
          component={(props) => {
            console.log("MasterDetail props:", props); // MasterDetail bileşenine gelen veriyi kontrol edin
            return <CurrentDetailView data={props.data.data} />;
          }}
        />

        <Column
          dataField="currentCode"
          caption="Cari Kodu"
          width={120}
          fixed={true}
        />
        <Column dataField="currentName" caption="Cari Adı" width={200} />
        <Column dataField="currentType" caption="Cari Tipi" width={120}>
          <Lookup dataSource={currentTypes} valueExpr="id" displayExpr="name" />
        </Column>
        <Column dataField="institution" caption="Kurum Tipi" width={120}>
          <Lookup
            dataSource={institutionTypes}
            valueExpr="id"
            displayExpr="name"
          />
        </Column>
        <Column dataField="title" caption="Ünvan" width={150} />
        <Column dataField="taxNumber" caption="Vergi No" width={120} />
        <Column dataField="taxOffice" caption="Vergi Dairesi" width={150} />
        <Column dataField="identityNo" caption="TC Kimlik No" width={120} />
        <Column dataField="webSite" caption="Web Sitesi" width={150} />
        <Column
          dataField="createdAt"
          caption="Oluşturma Tarihi"
          dataType="datetime"
          format="dd.MM.yyyy HH:mm"
          width={150}
        />
        <Column
          dataField="updatedAt"
          caption="Güncelleme Tarihi"
          dataType="datetime"
          format="dd.MM.yyyy HH:mm"
          width={150}
        />

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

export default CurrentList;
