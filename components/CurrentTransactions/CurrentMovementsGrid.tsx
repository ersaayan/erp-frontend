"use client";

import React, { useCallback, useEffect, useState } from "react";
import DataGrid, {
  Column,
  Selection,
  FilterRow,
  HeaderFilter,
  Scrolling,
  LoadPanel,
  StateStoring,
  Summary,
  TotalItem,
  Export,
  Toolbar,
  Item,
  SearchPanel,
  ColumnChooser,
} from "devextreme-react/data-grid";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, PencilIcon } from "lucide-react";
import { Current, CurrentMovement } from "./types";
import { useToast } from "@/hooks/use-toast";
import { Workbook } from "exceljs";
import { saveAs } from "file-saver-es";
import { exportDataGrid } from "devextreme/excel_exporter";
import { Button } from "@/components/ui/button";

interface CurrentMovementsGridProps {
  selectedCurrent: Current | null;
}

const CurrentMovementsGrid: React.FC<CurrentMovementsGridProps> = ({
  selectedCurrent,
}) => {
  const { toast } = useToast();
  const [movements, setMovements] = useState<CurrentMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  const fetchMovements = useCallback(async () => {
    if (!selectedCurrent) {
      setMovements([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.BASE_URL}/currentMovements/byCurrent/${selectedCurrent.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch current movements");
      }

      const data = await response.json();
      setMovements(data);
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
        description: "Failed to fetch current movements. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedCurrent, toast]);

  useEffect(() => {
    fetchMovements();

    const handleRefresh = () => {
      fetchMovements();
    };

    window.addEventListener("refreshCurrentMovements", handleRefresh);
    return () => {
      window.removeEventListener("refreshCurrentMovements", handleRefresh);
    };
  }, [fetchMovements]);

  const onExporting = useCallback((e: any) => {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Cari Hareketleri");

    const selectedData = e.component.getSelectedRowsData();

    exportDataGrid({
      component: e.component,
      worksheet,
      selectedRowsOnly: selectedData.length > 0,
      autoFilterEnabled: true,
      customizeCell: ({ gridCell, excelCell }: any) => {
        if (gridCell.rowType === "data") {
          if (typeof gridCell.value === "number") {
            excelCell.numFmt = "#,##0.00";
          } else if (gridCell.value instanceof Date) {
            excelCell.numFmt = "dd/mm/yyyy";
          }
        }
      },
    }).then(() => {
      workbook.xlsx.writeBuffer().then((buffer) => {
        saveAs(
          new Blob([buffer], { type: "application/octet-stream" }),
          "CariHareketleri.xlsx"
        );
      });
    });
  }, []);

  const handleEdit = useCallback(
    async (movement: CurrentMovement) => {
      const editableTypes = ["Devir"];

      if (!editableTypes.includes(movement.documentType)) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Bu hareket tipi düzenlenemez.",
        });
        return;
      }

      const event = new CustomEvent("openEditDialog", {
        detail: {
          movement,
          currentId: selectedCurrent?.id,
        },
      });
      window.dispatchEvent(event);
    },
    [selectedCurrent, toast]
  );

  const renderEditButton = useCallback(
    (data: any) => {
      const editableTypes = ["Devir"];
      if (!editableTypes.includes(data.data.documentType)) {
        return null;
      }

      return (
        <Button variant="ghost" size="sm" onClick={() => handleEdit(data.data)}>
          <PencilIcon className="h-4 w-4" />
        </Button>
      );
    },
    [handleEdit]
  );

  if (!selectedCurrent) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Hareket listesi için bir cari seçin
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading movements...</span>
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
      dataSource={movements}
      showBorders={true}
      showRowLines={true}
      showColumnLines={true}
      rowAlternationEnabled={true}
      columnAutoWidth={true}
      wordWrapEnabled={true}
      height="calc(100vh - 250px)"
      selectedRowKeys={selectedRowKeys}
      onSelectionChanged={(e) => setSelectedRowKeys(e.selectedRowKeys)}
      onExporting={onExporting}
    >
      <StateStoring
        enabled={true}
        type="localStorage"
        storageKey="currentMovementsGrid"
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
        dataField="dueDate"
        caption="Vade Tarihi"
        dataType="date"
        format="dd.MM.yyyy"
      />
      <Column dataField="documentNo" caption="Belge No" />
      <Column dataField="documentType" caption="Belge Tipi" />
      <Column dataField="description" caption="Açıklama" />
      <Column
        dataField="debtAmount"
        caption="Borç"
        dataType="number"
        format="#,##0.00"
      />
      <Column
        dataField="creditAmount"
        caption="Alacak"
        dataType="number"
        format="#,##0.00"
      />
      <Column
        dataField="balanceAmount"
        caption="Bakiye"
        dataType="number"
        format="#,##0.00"
      />
      <Column dataField="movementType" caption="Hareket Tipi" />
      <Column dataField="branchCode" caption="Şube Kodu" />

      <Summary>
        <TotalItem
          column="debtAmount"
          summaryType="sum"
          valueFormat="#,##0.00"
        />
        <TotalItem
          column="creditAmount"
          summaryType="sum"
          valueFormat="#,##0.00"
        />
      </Summary>

      <Column
        caption="İşlemler"
        width={100}
        alignment="center"
        cellRender={renderEditButton}
        allowFiltering={false}
        allowSorting={false}
      />

      <Toolbar>
        <Item name="searchPanel" />
        <Item name="exportButton" />
        <Item name="columnChooserButton" />
      </Toolbar>
    </DataGrid>
  );
};

export default CurrentMovementsGrid;
