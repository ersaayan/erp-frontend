"use client";

import React, { useCallback, useState } from "react";
import DataGrid, {
  Column,
  Editing,
  Lookup,
  Summary,
  TotalItem,
  Popup,
  SearchPanel,
  Selection,
} from "devextreme-react/data-grid";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface PurchaseInvoiceItemsProps {
  selectedWarehouseId?: string;
  selectedPriceListId?: string;
}

interface StockItem {
  id: string;
  productCode: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
}

const PurchaseInvoiceItems: React.FC<PurchaseInvoiceItemsProps> = ({
  selectedWarehouseId,
  selectedPriceListId,
}) => {
  const { toast } = useToast();
  const [items, setItems] = useState<StockItem[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const searchStocks = useCallback(
    async (searchText: string) => {
      if (!selectedWarehouseId) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Lütfen önce depo seçimi yapınız",
        });
        return;
      }

      if (searchText.length < 1) {
        setSearchResults([]);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:1303/stockcards/stockCardsWithRelations`
        );
        if (!response.ok) throw new Error("Failed to fetch stocks");
        const data = await response.json();

        // Filter and transform the results to include price list information
        const transformedData = data.map((stock: any) => {
          const priceListItem = stock.stockCardPriceLists?.find(
            (pl: any) => pl.priceListId === selectedPriceListId
          );

          return {
            ...stock,
            unitPrice: priceListItem ? parseFloat(priceListItem.price) : 0,
            vatRate: priceListItem ? parseFloat(priceListItem.vatRate) : 0,
          };
        });

        setSearchResults(transformedData);
      } catch (error) {
        console.error("Error searching stocks:", error);
        setSearchResults([]);
      }
    },
    [selectedWarehouseId, selectedPriceListId, toast]
  );

  const onInitNewRow = (e: any) => {
    if (!selectedWarehouseId) {
      e.cancel = true;
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Lütfen önce depo seçimi yapınız",
      });
      return;
    }
  };

  const onEditorPreparing = (e: any) => {
    if (e.dataField === "productCode" && e.parentType === "dataRow") {
      e.editorOptions.onValueChanged = async (args: any) => {
        if (args.value) {
          await searchStocks(args.value);
        }
      };
    }
  };

  const onRowInserted = (e: any) => {
    const selectedStock = searchResults.find(
      (stock) => stock.productCode === e.data.productCode
    );

    if (selectedStock) {
      const updatedItems = [...items];
      const index = updatedItems.findIndex((item) => item.id === e.data.id);

      if (index !== -1) {
        updatedItems[index] = {
          ...updatedItems[index],
          productName: selectedStock.productName,
          unit: selectedStock.unit,
          unitPrice: selectedStock.unitPrice,
          vatRate: selectedStock.vatRate,
        };
        setItems(updatedItems);
      }
    }
  };

  const calculateVatAmount = (rowData: any) => {
    if (!rowData.quantity || !rowData.unitPrice || !rowData.vatRate) return 0;
    return rowData.quantity * rowData.unitPrice * (rowData.vatRate / 100);
  };

  const calculateTotalAmount = (rowData: any) => {
    if (!rowData.quantity || !rowData.unitPrice) return 0;
    const subtotal = rowData.quantity * rowData.unitPrice;
    const vatAmount = calculateVatAmount(rowData);
    return subtotal + vatAmount;
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Kalemler</h3>
      <DataGrid
        dataSource={items}
        showBorders={true}
        height={400}
        onInitNewRow={onInitNewRow}
        onEditorPreparing={onEditorPreparing}
        onRowInserted={onRowInserted}
      >
        <SearchPanel visible={true} width={240} placeholder="Stok ara..." />
        <Selection mode="single" />
        <Editing
          mode="popup"
          allowUpdating={true}
          allowAdding={true}
          allowDeleting={true}
          useIcons={true}
        >
          <Popup title="Stok Detayları" showTitle={true} />
        </Editing>

        <Column dataField="productCode" caption="Stok Kodu">
          <Lookup
            dataSource={searchResults}
            valueExpr="productCode"
            displayExpr="productCode"
          />
        </Column>
        <Column dataField="productName" caption="Stok Adı" />
        <Column dataField="quantity" caption="Miktar" dataType="number" />
        <Column dataField="unit" caption="Birim" />
        <Column
          dataField="unitPrice"
          caption="Birim Fiyat"
          dataType="number"
          format="#,##0.00"
        />
        <Column dataField="vatRate" caption="KDV %" dataType="number" />
        <Column
          dataField="vatAmount"
          caption="KDV Tutarı"
          dataType="number"
          format="#,##0.00"
          calculateCellValue={calculateVatAmount}
        />
        <Column
          dataField="totalAmount"
          caption="Toplam"
          dataType="number"
          format="#,##0.00"
          calculateCellValue={calculateTotalAmount}
        />

        <Summary>
          <TotalItem
            column="vatAmount"
            summaryType="sum"
            valueFormat="#,##0.00"
          />
          <TotalItem
            column="totalAmount"
            summaryType="sum"
            valueFormat="#,##0.00"
          />
        </Summary>
      </DataGrid>
    </div>
  );
};

export default PurchaseInvoiceItems;
