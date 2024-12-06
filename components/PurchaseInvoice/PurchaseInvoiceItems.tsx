"use client";

import React, { useCallback, useState, useEffect, useRef } from "react";
import DataGrid, {
  Column,
  Export,
  Selection,
  FilterRow,
  HeaderFilter,
  Scrolling,
  LoadPanel,
  StateStoring,
  Summary,
  TotalItem,
  Export as DxExport,
  Toolbar,
  Item,
  SearchPanel,
  ColumnChooser,
  Editing,
} from "devextreme-react/data-grid";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ProductSelectionDialog from "./ProductSelectionDialog";
import { useProductSelectionDialog } from "./ProductSelectionDialog/useProductSelectionDialog";
import { Current } from "@/components/CurrentList/types";
import { Card } from "../ui/card";
import { getCurrencySymbol } from "@/lib/utils/currency";

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
  warehouseStock: number;
  lastStockUpdate?: string | null;
}

interface StockCardWarehouse {
  warehouseId: string;
  quantity: string;
  updatedAt?: string | null;
}

interface PriceListItem {
  priceListId: string;
  price: string;
  vatRate: string | null;
}

interface StockCard {
  id: string;
  stockCardWarehouse: StockCardWarehouse[];
  stockCardPriceLists: PriceListItem[];
}

interface PurchaseInvoiceItemsProps {
  selectedWarehouseId?: string | null;
  customer: Current | null;
  onTotalAmountChange: (total: number) => void;
}

const PurchaseInvoiceItems: React.FC<PurchaseInvoiceItemsProps> = ({
  selectedWarehouseId,
  customer,
  onTotalAmountChange,
}) => {
  const { toast } = useToast();
  const [items, setItems] = useState<StockItem[]>([]);
  const { openDialog } = useProductSelectionDialog();
  const isInitialMount = useRef(true);
  const previousCustomerId = useRef<string | null>(null);
  const [loading, setLoading] = useState(false);

  const calculateVatAmount = (rowData: StockItem): number => {
    if (!rowData.quantity || !rowData.unitPrice || !rowData.vatRate) return 0;
    return rowData.quantity * rowData.unitPrice * (rowData.vatRate / 100);
  };

  const calculateTotalAmount = (rowData: StockItem): number => {
    if (!rowData.quantity || !rowData.unitPrice) return 0;
    const subtotal = rowData.quantity * rowData.unitPrice;
    const vatAmount = calculateVatAmount(rowData);
    return subtotal + vatAmount;
  };

  const calculateAndUpdateTotal = useCallback(
    (currentItems: StockItem[]) => {
      const total = currentItems.reduce((sum, item) => {
        return sum + calculateTotalAmount(item);
      }, 0);
      onTotalAmountChange(total);
    },
    [onTotalAmountChange]
  );

  useEffect(() => {
    const currentCustomerId = customer?.id;

    if (
      isInitialMount.current ||
      currentCustomerId === previousCustomerId.current
    ) {
      isInitialMount.current = false;
      previousCustomerId.current = currentCustomerId;
      return;
    }

    previousCustomerId.current = currentCustomerId;

    if (items.length > 0 && customer?.priceListId) {
      const updatePrices = async () => {
        try {
          setLoading(true); // Add loading state

          const response = await fetch(
            `${process.env.BASE_URL}/stockcards/stockCardsWithRelations`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
              },
              credentials: "include",
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const stockData: StockCard[] = await response.json();

          if (!Array.isArray(stockData)) {
            throw new Error("Invalid response format");
          }

          const updatedItems = items.map((item) => {
            const stockCard = stockData.find((s) => s.id === item.id);
            if (!stockCard) {
              console.log(`Stock card not found for item: ${item.id}`);
              return item;
            }

            const priceListItem = stockCard.stockCardPriceLists.find(
              (pl) => pl.priceListId === customer.priceListId
            );

            if (!priceListItem) {
              console.log(`Price list item not found for item: ${item.id}`);
              return item;
            }

            const newUnitPrice = parseFloat(priceListItem.price);
            const newVatRate = parseFloat(priceListItem.vatRate || "0");

            if (
              newUnitPrice !== item.unitPrice ||
              newVatRate !== item.vatRate
            ) {
              const updatedItem = {
                ...item,
                unitPrice: newUnitPrice,
                vatRate: newVatRate,
              };

              return {
                ...updatedItem,
                vatAmount: calculateVatAmount(updatedItem),
                totalAmount: calculateTotalAmount(updatedItem),
              };
            }

            return item;
          });

          setItems(updatedItems);
          calculateAndUpdateTotal(updatedItems);

          toast({
            title: "Fiyatlar Güncellendi",
            description:
              "Ürün fiyatları yeni fiyat listesine göre güncellendi.",
          });
        } catch (error) {
          console.error("Error updating prices:", error);

          // More specific error messages based on error type
          let errorMessage = "Fiyatlar güncellenirken bir hata oluştu.";
          if (error instanceof Error) {
            if (error.message.includes("HTTP error")) {
              errorMessage = "Sunucu bağlantısında hata oluştu.";
            } else if (error.message === "Invalid response format") {
              errorMessage = "Sunucudan geçersiz veri formatı alındı.";
            }
          }

          toast({
            variant: "destructive",
            title: "Hata",
            description: errorMessage,
          });
        } finally {
          setLoading(false);
        }
      };

      updatePrices();
    }
  }, [
    customer?.id,
    customer?.priceListId,
    items,
    calculateAndUpdateTotal,
    toast,
    calculateVatAmount,
    calculateTotalAmount,
  ]);

  const handleProductsSelected = useCallback(
    (selectedProducts: any[]) => {
      if (!Array.isArray(selectedProducts)) {
        console.error("Selected products is not an array:", selectedProducts);
        return;
      }

      const newItems = selectedProducts.map((product) => {
        const warehouseStock = product.stockCardWarehouse?.find(
          (w: StockCardWarehouse) => w.warehouseId === selectedWarehouseId
        );

        return {
          id: product.id,
          productCode: product.productCode,
          productName: product.productName,
          quantity: 1,
          unit: product.unit,
          unitPrice: product.price || 0,
          vatRate: product.vatRate || 0,
          vatAmount: 0,
          totalAmount: 0,
          warehouseStock: warehouseStock
            ? parseInt(warehouseStock.quantity, 10)
            : 0,
          lastStockUpdate: warehouseStock?.updatedAt || null,
        };
      });

      setItems((prevItems) => {
        const existingIds = new Set(prevItems.map((item) => item.id));
        const uniqueNewItems = newItems.filter(
          (item) => !existingIds.has(item.id)
        );
        return [...prevItems, ...uniqueNewItems];
      });
    },
    [selectedWarehouseId]
  );

  useEffect(() => {
    if (!isInitialMount.current) {
      calculateAndUpdateTotal(items);
    } else {
      isInitialMount.current = false;
    }
  }, [items, calculateAndUpdateTotal]);

  const validateEditorValue = (e: any) => {
    const { dataField, value } = e;

    if (dataField === "quantity") {
      if (value <= 0) {
        e.cancel = true;
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Miktar 0'dan büyük olmalıdır",
        });
      }
    } else if (dataField === "unitPrice") {
      if (value < 0) {
        e.cancel = true;
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Birim fiyat negatif olamaz",
        });
      }
    } else if (dataField === "vatRate") {
      if (value < 0 || value > 100) {
        e.cancel = true;
        toast({
          variant: "destructive",
          title: "Hata",
          description: "KDV oranı 0-100 arasında olmalıdır",
        });
      }
    }
  };

  const onRowUpdated = (e: any) => {
    const { data } = e;
    const updatedItems = items.map((item) =>
      item.id === data.id
        ? {
            ...item,
            ...data,
            vatAmount: calculateVatAmount(data),
            totalAmount: calculateTotalAmount(data),
          }
        : item
    );
    setItems(updatedItems);
  };

  const onRowRemoved = (e: any) => {
    const updatedItems = items.filter((item) => item.id !== e.data.id);
    setItems(updatedItems);
  };

  useEffect(() => {
    if (selectedWarehouseId && items.length > 0) {
      const fetchWarehouseStock = async () => {
        try {
          const response = await fetch(
            `${process.env.BASE_URL}/stockcards/stockCardsWithRelations`
          );
          if (!response.ok) throw new Error("Failed to fetch stock data");

          const stockData: StockCard[] = await response.json();
          const updatedItems = items.map((item) => {
            const stockCard = stockData.find((s) => s.id === item.id);
            const warehouseStock = stockCard?.stockCardWarehouse?.find(
              (w) => w.warehouseId === selectedWarehouseId
            );

            return {
              ...item,
              warehouseStock: warehouseStock
                ? parseInt(warehouseStock.quantity, 10)
                : 0,
              lastStockUpdate: warehouseStock?.updatedAt || null,
            };
          });

          setItems(updatedItems);
        } catch (error) {
          console.error("Error updating warehouse stock:", error);
        }
      };

      fetchWarehouseStock();
    }
  }, [selectedWarehouseId]);

  const stockCellRender = (cellData: any) => {
    const value = cellData.value || 0;
    return (
      <div
        className={`text-right ${value < 0 ? "text-red-500" : ""}`}
        title={
          cellData.data.lastStockUpdate
            ? `Son güncelleme: ${new Date(
                cellData.data.lastStockUpdate
              ).toLocaleString("tr-TR")}`
            : undefined
        }
      >
        {value}
      </div>
    );
  };

  const handleAddProducts = () => {
    if (!selectedWarehouseId) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Lütfen önce depo seçimi yapınız",
      });
      return;
    }
    openDialog();
  };

  const currencySymbol = customer?.priceList?.currency
    ? getCurrencySymbol(customer.priceList.currency)
    : "₺";

  return (
    <Card className="p-6">
      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Kalemler</h3>
          <Button variant="outline" onClick={handleAddProducts}>
            <Plus className="h-4 w-4 mr-2" />
            Ürün Ekle
          </Button>
        </div>

        <DataGrid
          dataSource={items}
          showBorders={true}
          height={400}
          onRowUpdated={onRowUpdated}
          onRowRemoved={onRowRemoved}
          onEditorPreparing={validateEditorValue}
        >
          <SearchPanel visible={true} width={240} placeholder="Stok ara..." />
          <Selection mode="single" />
          <Editing mode="cell" allowUpdating={true} allowDeleting={true} />

          <Column
            dataField="productCode"
            caption="Stok Kodu"
            allowEditing={false}
          />
          <Column
            dataField="productName"
            caption="Stok Adı"
            allowEditing={false}
          />
          <Column
            dataField="quantity"
            caption="Miktar"
            dataType="number"
            validationRules={[{ type: "required" }, { type: "numeric" }]}
          />
          <Column dataField="unit" caption="Birim" allowEditing={false} />
          <Column
            dataField="warehouseStock"
            caption="Depodaki Stok"
            dataType="number"
            allowEditing={false}
            cellRender={stockCellRender}
            sortOrder="desc"
          />
          <Column
            dataField="unitPrice"
            caption={`Birim Fiyat (${currencySymbol})`}
            dataType="number"
            format="#,##0.00"
            validationRules={[{ type: "required" }, { type: "numeric" }]}
          />
          <Column
            dataField="vatRate"
            caption="KDV %"
            dataType="number"
            validationRules={[
              { type: "required" },
              { type: "range", min: 0, max: 100 },
            ]}
          />
          <Column
            dataField="vatAmount"
            caption={`KDV Tutarı (${currencySymbol})`}
            dataType="number"
            format="#,##0.00"
            calculateCellValue={calculateVatAmount}
            allowEditing={false}
          />
          <Column
            dataField="totalAmount"
            caption={`Toplam (${currencySymbol})`}
            dataType="number"
            format="#,##0.00"
            calculateCellValue={calculateTotalAmount}
            allowEditing={false}
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

        <ProductSelectionDialog
          onProductsSelected={handleProductsSelected}
          customer={customer}
          selectedWarehouseId={selectedWarehouseId}
        />
      </div>
    </Card>
  );
};

export default PurchaseInvoiceItems;
