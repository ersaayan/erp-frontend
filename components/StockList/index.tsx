"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
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
import { AlertCircle } from "lucide-react";
import { useStockList } from "./hooks/useStockList";
import { useBulkPrint } from "./hooks/useBulkPrint";
import StockListToolbar from "./components/StockListToolbar";
import StockListSettings from "./components/StockListSettings";
import BulkActions from "./components/BulkActions";
import {
  calculateTotalQuantity,
  getCategoryPath,
  renderPriceWithTRY,
} from "./utils/stockHelpers";
import { useToast } from "@/hooks/use-toast";
import { StockCard } from "./types";

interface StockListProps {
  onMenuItemClick: (itemName: string) => void;
}

const StockList: React.FC<StockListProps> = ({ onMenuItemClick }) => {
  const {
    stockData,
    loading,
    error,
    exchangeRates,
    fetchData,
    handleDeleteSelected,
  } = useStockList();
  const { printLoading, handleBulkPrint } = useBulkPrint();
  const { toast } = useToast();

  const dataGridRef = useRef<DataGrid>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [quickFilterText, setQuickFilterText] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [bulkActionsOpen, setBulkActionsOpen] = useState(false);
  const [settings, setSettings] = useState({
    showGroupPanel: true,
    showFilterRow: true,
    showHeaderFilter: true,
    alternateRowColoring: true,
    pageSize: "50",
    virtualScrolling: true,
  });
  // Sayfa yüklendiğinde localStorage'dan seçili stokları al
  const [selectedStocks, setSelectedStocks] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const savedStocks = localStorage.getItem("selectedStocks");
      return savedStocks ? JSON.parse(savedStocks) : [];
    }
    return [];
  });

  const handleRowDblClick = useCallback(
    async (e: any) => {
      try {
        localStorage.setItem("currentStockData", JSON.stringify(e.data));
        onMenuItemClick("Stok Formu");
        toast({
          title: "Success",
          description: "Opening stock form...",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to open stock form. Please try again.",
        });
      }
    },
    [onMenuItemClick, toast]
  );

  // Seçili stokları localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem("selectedStocks", JSON.stringify(selectedRowKeys));
  }, [selectedRowKeys]);

  // Component unmount olduğunda seçili stokları temizle
  useEffect(() => {
    return () => {
      localStorage.removeItem("selectedStocks");
    };
  }, []);
  const handleSettingsChange = useCallback(
    (key: string, value: boolean | string) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleQuickFilter = useCallback(() => {
    if (!dataGridRef.current) return;
    const instance = dataGridRef.current.instance;

    if (quickFilterText) {
      instance.filter([
        ["productCode", "contains", quickFilterText],
        "or",
        ["productName", "contains", quickFilterText],
        "or",
        ["barcodes[0].barcode", "contains", quickFilterText],
      ]);
    } else {
      instance.clearFilter();
    }
  }, [quickFilterText]);

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
      <StockListToolbar
        quickFilterText={quickFilterText}
        onQuickFilterChange={setQuickFilterText}
        onApplyQuickFilter={handleQuickFilter}
        onClearFilter={() => {
          setQuickFilterText("");
          dataGridRef.current?.instance.clearFilter();
        }}
        onRefresh={fetchData}
        onImport={() => fileInputRef.current?.click()}
        onSettingsOpen={() => setSettingsOpen(true)}
        onBulkActionsToggle={() => setBulkActionsOpen(!bulkActionsOpen)}
        fileInputRef={fileInputRef}
      />

      {bulkActionsOpen && (
        <BulkActions
          onDelete={() => handleDeleteSelected(selectedRowKeys)}
          onPrint={() => {
            const selectedStocks = stockData.filter((stock) =>
              selectedRowKeys.includes(stock.id)
            );
            handleBulkPrint(selectedStocks);
          }}
          printLoading={printLoading}
        />
      )}

      <DataGrid
        ref={dataGridRef}
        dataSource={stockData}
        showBorders={true}
        showRowLines={true}
        showColumnLines={true}
        rowAlternationEnabled={settings.alternateRowColoring}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnAutoWidth={true}
        wordWrapEnabled={true}
        height="calc(100vh - 200px)"
        selectedRowKeys={selectedRowKeys}
        onSelectionChanged={(e) => {
          const newSelectedKeys = e.selectedRowKeys as string[];
          setSelectedRowKeys(newSelectedKeys);
          localStorage.setItem(
            "selectedStocks",
            JSON.stringify(newSelectedKeys)
          );
        }}
        onRowDblClick={handleRowDblClick}
        loadPanel={{ enabled: loading }}
      >
        <StateStoring
          enabled={true}
          type="localStorage"
          storageKey="stockListGrid"
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
        <Export enabled={true} allowExportSelectedData={true} />
        <ColumnChooser enabled={true} mode="select" />

        <Column
          dataField="productCode"
          caption="Stock Code"
          width={120}
          fixed={true}
        />
        <Column dataField="productName" caption="Stock Name" width={200} />
        <Column dataField="brand.brandName" caption="Brand" width={120} />
        <Column dataField="unit" caption="Unit" width={80} />
        <Column
          caption="Category"
          calculateCellValue={getCategoryPath}
          width={200}
        />
        <Column
          caption="Total Stock"
          calculateCellValue={calculateTotalQuantity}
          dataType="number"
          format="#,##0"
          width={100}
        />

        <Column caption="Warehouses">
          {stockData[0]?.stockCardWarehouse.map((warehouse) => (
            <Column
              key={warehouse.warehouse.id}
              caption={warehouse.warehouse.warehouseName}
              calculateCellValue={(rowData: StockCard) => {
                const warehouseData = rowData.stockCardWarehouse.find(
                  (w) => w.warehouse.id === warehouse.warehouse.id
                );
                return warehouseData ? parseInt(warehouseData.quantity, 10) : 0;
              }}
              dataType="number"
              format="#,##0"
              width={100}
            />
          ))}
        </Column>

        <Column caption="Prices">
          {stockData[0]?.stockCardPriceLists.map((priceList) => (
            <Column
              key={priceList.priceList.id}
              caption={`${priceList.priceList.priceListName} (${priceList.priceList.currency})`}
              calculateCellValue={(rowData: StockCard) => {
                const priceData = rowData.stockCardPriceLists.find(
                  (p) => p.priceList.id === priceList.priceList.id
                );
                if (!priceData) return 0;

                const price = parseFloat(priceData.price);
                return priceList.priceList.currency === "USD"
                  ? renderPriceWithTRY(price, "USD", exchangeRates)
                  : price.toFixed(2);
              }}
              width={150}
            />
          ))}
        </Column>

        <Column dataField="productType" caption="Product Type" width={120} />
        <Column
          dataField="stockStatus"
          caption="Status"
          dataType="boolean"
          width={80}
        />
        <Column
          dataField="createdAt"
          caption="Created Date"
          dataType="datetime"
          format="dd.MM.yyyy HH:mm"
          width={140}
        />

        <Summary>
          <TotalItem
            column="Total Stock"
            summaryType="sum"
            valueFormat="#,##0"
          />
        </Summary>

        <Toolbar>
          <Item name="groupPanel" />
          <Item name="exportButton" />
          <Item name="columnChooserButton" />
        </Toolbar>
      </DataGrid>

      <StockListSettings
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />
    </div>
  );
};

export default StockList;
