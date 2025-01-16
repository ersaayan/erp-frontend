"use client";

import React, { useCallback, useEffect, useState } from "react";
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

const receiptTypes = [
  { id: "Giris", name: "Giriş Fişi" },
  { id: "Cikis", name: "Çıkış Fişi" },
];

const ReceiptListGrid: React.FC = () => {
  const { toast } = useToast();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReceipts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.BASE_URL}/warehouses/receipts`,
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

      const data = await response.json();
      setReceipts(data);
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
        description: "Failed to fetch receipts. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

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
    <DataGrid
      dataSource={receipts}
      showBorders={true}
      showRowLines={true}
      showColumnLines={true}
      rowAlternationEnabled={true}
      allowColumnReordering={true}
      allowColumnResizing={true}
      columnResizingMode="widget"
      columnAutoWidth={true}
      wordWrapEnabled={true}
      height="calc(100vh - 250px)"
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
      <Scrolling mode="virtual" rowRenderingMode="virtual" />
      <Paging enabled={false} />
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
  );
};

export default ReceiptListGrid;
