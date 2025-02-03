/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useCallback, useState, useRef } from "react";
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
import CustomStore from "devextreme/data/custom_store";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(
    null
  );
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  const createCustomStore = useCallback(() => {
    return new CustomStore({
      key: "id",
      load: async (loadOptions: any) => {
        const page = loadOptions.skip
          ? Math.floor(loadOptions.skip / loadOptions.take) + 1
          : 1;
        const limit = loadOptions.take || 20;

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

        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...filter,
        });

        try {
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
            throw new Error("Failed to fetch receipts");
          }

          const result = await response.json();
          return {
            data: result.data,
            totalCount: result.total,
          };
        } catch (error) {
          console.error("Error fetching receipts:", error);
          throw error;
        }
      },
    });
  }, []);

  const dataSourceRef = useRef<CustomStore | null>(null);
  if (!dataSourceRef.current) {
    dataSourceRef.current = createCustomStore();
  }
  const dataSource = dataSourceRef.current;

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

    try {
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

      await dataSource.reload();
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
    }
  }, [selectedRowKeys, toast, dataSource]);

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
        <LoadPanel enabled={loading} />
        <Selection mode="multiple" showCheckBoxesMode="always" />
        <FilterRow visible={true} />
        <HeaderFilter visible={true} />
        <GroupPanel visible={true} />
        <Grouping autoExpandAll={false} />
        <ColumnChooser enabled={true} mode="select" />
        <ColumnFixing enabled={true} />
        <Scrolling mode="virtual" rowRenderingMode="virtual" />
        <Paging defaultPageSize={20} />
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
