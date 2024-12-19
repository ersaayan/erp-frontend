import React, { useCallback, useState, useEffect } from "react";
import DataGrid, {
  Column,
  Export,
  Editing,
  Lookup,
  FilterRow,
  HeaderFilter,
  Selection,
  Toolbar,
  Item,
  ColumnChooser,
  Button as DxButton,
} from "devextreme-react/data-grid";
import { Workbook } from "exceljs";
import { saveAs } from "file-saver-es";
import { exportDataGrid } from "devextreme/excel_exporter";
import { StockUnit } from "./types";
import { usePriceLists } from "./hooks/usePriceLists";
import { useStockForm } from "./hooks/useStockForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { ErrorBoundary } from "./ErrorBoundary";
// Barcode generator function
const generateBarcode = () => {
  return Math.floor(Math.random() * 1000000000000).toString();
};

interface StockUnitsGridProps {
  units: StockUnit[];
  setUnits: React.Dispatch<React.SetStateAction<StockUnit[]>>;
}

const StockUnitsGridContent: React.FC<StockUnitsGridProps> = ({
  units,
  setUnits,
}) => {
  const {
    priceLists = [],
    loading: priceListsLoading,
    error: priceListsError,
  } = usePriceLists();
  const { formState, updatePriceListItems } = useStockForm();
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Excel export handler
  const onExporting = useCallback((e: any) => {
    try {
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet("Birimler");

      exportDataGrid({
        component: e.component,
        worksheet,
        autoFilterEnabled: true,
      }).then(() => {
        workbook.xlsx.writeBuffer().then((buffer) => {
          saveAs(
            new Blob([buffer], { type: "application/octet-stream" }),
            "Birimler.xlsx"
          );
        });
      });
    } catch (error) {
      setError("Excel dışa aktarma işlemi sırasında bir hata oluştu");
      console.error("Export error:", error);
    }
  }, []);

  // Component mount effect
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!mounted || !Array.isArray(priceLists)) return;

    try {
      const unitsFromPriceLists = priceLists
        .map((priceList) => {
          if (!priceList?.id) return null;

          const existingUnit = units.find(
            (unit) => unit.priceListId === priceList.id
          );
          if (existingUnit) return existingUnit;

          const formItem = formState.priceListItems?.find(
            (item) => item?.priceListId === priceList.id
          );

          return {
            id: formItem?.id?.toString() || "",
            value: "",
            label: "",
            priceListId: priceList.id,
            vatRate: formItem?.vatRate ?? (priceList.isVatIncluded ? 20 : null),
            price: formItem?.price ?? 0,
            priceWithVat: formItem?.priceWithVat ?? 0,
            barcode: formItem?.barcode || generateBarcode(),
          };
        })
        .filter(Boolean);

      if (JSON.stringify(units) !== JSON.stringify(unitsFromPriceLists)) {
        setUnits(unitsFromPriceLists);
      }
    } catch (error) {
      console.error("Units initialization error:", error);
      setError("Birim listesi oluşturulurken bir hata oluştu");
    }
  }, [priceLists, formState.priceListItems, setUnits, units, mounted]);

  // Update form state when units change
  useEffect(() => {
    try {
      if (!units?.length) return;

      const unitsToUpdate = units.map((unit) => ({
        id: unit.id,
        priceListId: unit.priceListId,
        vatRate: unit.vatRate,
        price: unit.price,
        priceWithVat: unit.priceWithVat,
        barcode: unit.barcode,
      }));

      if (
        JSON.stringify(formState.priceListItems) !==
        JSON.stringify(unitsToUpdate)
      ) {
        updatePriceListItems(unitsToUpdate);
      }
    } catch (error) {
      setError("Form güncelleme sırasında bir hata oluştu");
      console.error("Form update error:", error);
    }
  }, [units, formState.priceListItems, updatePriceListItems]);

  // Loading state check
  if (!mounted || priceListsLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Yükleniyor...</span>
      </div>
    );
  }

  // Error state check
  if (priceListsError || error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {priceListsError || error || "Bir hata oluştu"}
        </AlertDescription>
      </Alert>
    );
  }

  // Price calculation with VAT
  const calculatePriceWithVat = (price: number, vatRate: number | null) => {
    if (!price || !vatRate) return price;
    return parseFloat((price * (1 + vatRate / 100)).toFixed(2));
  };

  // Editor preparing handler
  const onEditorPreparing = (e: any) => {
    if (!e?.dataField || !e?.row?.data?.priceListId) return;

    const priceList = priceLists.find((pl) => pl.id === e.row.data.priceListId);
    if (e.dataField === "vatRate" && e.editorOptions) {
      e.editorOptions.disabled = !priceList?.isVatIncluded;
    }
  };

  // Row update handler
  const onRowUpdated = (e: any) => {
    try {
      const { data } = e;
      if (!data?.priceListId) return;

      const updatedUnits = units.map((unit) => {
        if (unit.priceListId === data.priceListId) {
          const priceList = priceLists.find((pl) => pl.id === unit.priceListId);
          const updatedUnit = { ...unit, ...data };

          updatedUnit.priceWithVat =
            priceList?.isVatIncluded && updatedUnit.vatRate !== null
              ? calculatePriceWithVat(updatedUnit.price, updatedUnit.vatRate)
              : updatedUnit.price;

          return updatedUnit;
        }
        return unit;
      });

      if (JSON.stringify(units) !== JSON.stringify(updatedUnits)) {
        setUnits(updatedUnits);
      }
    } catch (error) {
      setError("Satır güncelleme sırasında bir hata oluştu");
      console.error("Row update error:", error);
    }
  };

  // Row removing handler
  const onRowRemoving = (e: any) => {
    try {
      e.cancel = true;
      const updatedUnits = units.map((unit) =>
        unit.priceListId === e.data.priceListId
          ? { ...unit, price: 0, vatRate: 0, priceWithVat: 0 }
          : unit
      );

      if (JSON.stringify(units) !== JSON.stringify(updatedUnits)) {
        setUnits(updatedUnits);
      }
    } catch (error) {
      setError("Satır silme sırasında bir hata oluştu");
      console.error("Row removing error:", error);
    }
  };

  return (
    <DataGrid
      dataSource={units}
      showBorders={true}
      showRowLines={true}
      showColumnLines={true}
      rowAlternationEnabled={true}
      columnAutoWidth={true}
      wordWrapEnabled={true}
      onExporting={onExporting}
      onRowUpdated={onRowUpdated}
      onEditorPreparing={onEditorPreparing}
      onRowRemoving={onRowRemoving}
    >
      <Selection mode="single" />
      <FilterRow visible={true} />
      <HeaderFilter visible={true} />
      <Export enabled={true} />
      <ColumnChooser enabled={true} mode="select" />
      <Editing mode="cell" allowUpdating={true} allowDeleting={true} />

      <Column type="buttons" width={70} caption="Sil">
        <DxButton name="delete" />
      </Column>

      <Column
        dataField="priceListId"
        caption="Fiyat Listesi"
        allowEditing={false}
      >
        <Lookup
          dataSource={priceLists}
          valueExpr="id"
          displayExpr={(item: any) =>
            item
              ? `${item.priceListName} (${item.currency})${
                  item.isVatIncluded ? " - KDV Dahil" : ""
                }`
              : ""
          }
        />
      </Column>

      <Column
        dataField="price"
        caption="Fiyat"
        dataType="number"
        format="#,##0.00"
        allowEditing={true}
      />

      <Column
        dataField="vatRate"
        caption="KDV (%)"
        dataType="number"
        format="#,##0"
        allowEditing={true}
        calculateCellValue={(rowData: StockUnit) => {
          const priceList = priceLists.find(
            (pl) => pl.id === rowData.priceListId
          );
          return priceList?.isVatIncluded ? rowData.vatRate : 0;
        }}
      />

      <Column
        dataField="priceWithVat"
        caption="KDV Dahil Fiyat"
        dataType="number"
        format="#,##0.00"
        allowEditing={false}
        calculateCellValue={(rowData: StockUnit) => {
          const priceList = priceLists.find(
            (pl) => pl.id === rowData.priceListId
          );
          return priceList?.isVatIncluded && rowData.vatRate !== null
            ? calculatePriceWithVat(rowData.price, rowData.vatRate)
            : rowData.price;
        }}
      />

      <Column dataField="barcode" caption="Barkod" allowEditing={true} />

      <Toolbar>
        <Item name="exportButton" location="after" />
        <Item name="columnChooserButton" location="after" />
      </Toolbar>
    </DataGrid>
  );
};

export const StockUnitsGrid: React.FC<StockUnitsGridProps> = (props) => {
  return (
    <ErrorBoundary
      fallback={
        <Alert variant="destructive">
          <AlertDescription>
            Birimler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.
          </AlertDescription>
        </Alert>
      }
    >
      <StockUnitsGridContent {...props} />
    </ErrorBoundary>
  );
};
