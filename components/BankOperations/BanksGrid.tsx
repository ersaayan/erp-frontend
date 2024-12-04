import React, { useCallback, useEffect, useState } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Pencil } from "lucide-react";
import { Bank } from "./types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useBankDialog } from "./BankDialog/useBankDialog";

interface BanksGridProps {
  onBankSelect: (bank: Bank) => void;
}

const BanksGrid: React.FC<BanksGridProps> = ({ onBankSelect }) => {
  const { toast } = useToast();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const { openDialog } = useBankDialog();

  const fetchBanks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.BASE_URL}/banks`);
      if (!response.ok) {
        throw new Error("Failed to fetch banks");
      }
      const data = await response.json();
      setBanks(data);
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
        description: "Failed to fetch banks. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchBanks();

    const handleRefresh = () => {
      fetchBanks();
    };

    window.addEventListener("refreshBankOperations", handleRefresh);
    return () => {
      window.removeEventListener("refreshBankOperations", handleRefresh);
    };
  }, [fetchBanks]);

  const handleRowClick = (e: any) => {
    onBankSelect(e.data);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading banks...</span>
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
      dataSource={banks}
      showBorders={true}
      showRowLines={true}
      showColumnLines={true}
      rowAlternationEnabled={true}
      allowColumnReordering={true}
      allowColumnResizing={true}
      columnAutoWidth={true}
      wordWrapEnabled={true}
      height="calc(100vh - 250px)"
      onRowClick={handleRowClick}
      selectedRowKeys={selectedRowKeys}
      onSelectionChanged={(e) => setSelectedRowKeys(e.selectedRowKeys)}
    >
      <StateStoring enabled={true} type="localStorage" storageKey="banksGrid" />
      <Selection mode="multiple" showCheckBoxesMode="always" />
      <FilterRow visible={true} />
      <HeaderFilter visible={true} />
      <FilterPanel visible={true} />
      <FilterBuilderPopup position={{ my: "top", at: "top", of: window }} />
      <GroupPanel visible={true} />
      <Grouping autoExpandAll={false} />
      <Scrolling mode="virtual" />
      <Paging enabled={true} pageSize={50} />
      <Export enabled={true} allowExportSelectedData={true} />
      <ColumnChooser enabled={true} mode="select" />

      <Column dataField="bankName" caption="Banka Adı" />
      <Column dataField="branchCode" caption="Şube Kodu" />
      <Column
        dataField="balance"
        caption="Bakiye"
        dataType="number"
        format="#,##0.00"
        calculateCellValue={(rowData: Bank) => parseFloat(rowData.balance)}
      />
      <Column dataField="currency" caption="Para Birimi" width={100} />
      <Column
        width={70}
        caption="İşlemler"
        cellRender={(cellData: any) => (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={(e) => {
              e.stopPropagation();
              openDialog(cellData.data);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      />

      <Summary>
        <TotalItem column="balance" summaryType="sum" valueFormat="#,##0.00" />
      </Summary>

      <Toolbar>
        <Item name="groupPanel" />
        <Item name="exportButton" />
        <Item name="columnChooserButton" />
      </Toolbar>
    </DataGrid>
  );
};

export default BanksGrid;
