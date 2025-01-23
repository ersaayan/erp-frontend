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
import { AlertCircle, Loader2, PencilIcon, Trash2Icon } from "lucide-react";
import { Current, CurrentMovement } from "./types";
import { useToast } from "@/hooks/use-toast";
import { Workbook } from "exceljs";
import { saveAs } from "file-saver-es";
import { exportDataGrid } from "devextreme/excel_exporter";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [movementToDelete, setMovementToDelete] =
    useState<CurrentMovement | null>(null);

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

  const handleDelete = useCallback(
    async (movement: CurrentMovement) => {
      const deletableTypes = ["Devir"];

      if (!deletableTypes.includes(movement.documentType)) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Bu hareket tipi silinemez.",
        });
        return;
      }

      setMovementToDelete(movement);
      setDeleteDialogOpen(true);
    },
    [toast]
  );

  const confirmDelete = async () => {
    if (!movementToDelete) return;

    try {
      setLoading(true);

      // Cari hareketi sil
      const currentMovementResponse = await fetch(
        `${process.env.BASE_URL}/currentMovements/${movementToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );

      if (!currentMovementResponse.ok) {
        throw new Error("Cari hareket silinemedi");
      }

      // İlişkili hareketi sil
      const relatedMovementResponse = await fetch(
        `${process.env.BASE_URL}/currentMovements/${movementToDelete.id}/related`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );

      if (!relatedMovementResponse.ok) {
        throw new Error("İlişkili hareket silinemedi");
      }

      toast({
        title: "Başarılı",
        description: "Hareket başarıyla silindi",
      });

      fetchMovements();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description:
          error instanceof Error
            ? error.message
            : "Hareket silinirken bir hata oluştu",
      });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setMovementToDelete(null);
    }
  };

  const renderActionButtons = useCallback(
    (data: any) => {
      const editableTypes = ["Devir"];
      const movement = data.data;

      if (!editableTypes.includes(movement.documentType)) {
        return null;
      }

      return (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(movement)}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(movement)}
          >
            <Trash2Icon className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      );
    },
    [handleEdit, handleDelete]
  );

  // Toplam değerleri hesapla
  const calculateTotals = () => {
    const totalDebt = movements.reduce(
      (sum, movement) =>
        sum + (movement.debtAmount ? parseFloat(movement.debtAmount) : 0),
      0
    );
    const totalCredit = movements.reduce(
      (sum, movement) =>
        sum + (movement.creditAmount ? parseFloat(movement.creditAmount) : 0),
      0
    );
    const balance = totalDebt - totalCredit;
    return { totalDebt, totalCredit, balance };
  };

  const { totalDebt, totalCredit, balance } = calculateTotals();

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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 border">
          <div className="flex flex-col">
            <div className="text-xs font-medium text-muted-foreground mb-1">
              Borç Toplamı
            </div>
            <div className="text-xl font-bold text-red-600 tracking-tight">
              {new Intl.NumberFormat("tr-TR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(totalDebt)}
            </div>
          </div>
        </Card>
        <Card className="p-3 border">
          <div className="flex flex-col">
            <div className="text-xs font-medium text-muted-foreground mb-1">
              Alacak Toplamı
            </div>
            <div className="text-xl font-bold text-green-600 tracking-tight">
              {new Intl.NumberFormat("tr-TR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(totalCredit)}
            </div>
          </div>
        </Card>
        <Card className="p-3 border">
          <div className="flex flex-col">
            <div className="text-xs font-medium text-muted-foreground mb-1">
              Bakiye
            </div>
            <div className="flex items-baseline">
              <span
                className={`text-xl font-bold tracking-tight ${
                  balance >= 0 ? "text-red-600" : "text-green-600"
                }`}
              >
                {new Intl.NumberFormat("tr-TR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(Math.abs(balance))}
              </span>
              <span className="text-xs font-medium ml-2 text-muted-foreground">
                {balance >= 0 ? "Borç" : "Alacak"}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
          width={120}
          alignment="center"
          cellRender={renderActionButtons}
          allowFiltering={false}
          allowSorting={false}
        />

        <Toolbar>
          <Item name="searchPanel" />
          <Item name="exportButton" />
          <Item name="columnChooserButton" />
        </Toolbar>
      </DataGrid>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hareketi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu hareketi silmek istediğinizden emin misiniz? Bu işlem geri
              alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={loading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {loading ? "Siliniyor..." : "Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CurrentMovementsGrid;
