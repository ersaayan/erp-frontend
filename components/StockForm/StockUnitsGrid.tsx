"use client";

import React from "react";
import DataGrid, {
  Column,
  Editing,
  Lookup,
  Export,
  FilterRow,
  HeaderFilter,
  Selection,
  Toolbar,
  Item,
  ColumnChooser,
  Button as DxButton,
} from "devextreme-react/data-grid";
import { StockUnit } from "../types";
import { usePriceLists } from "./hooks/usePriceLists";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

interface StockUnitsGridProps {
  units: StockUnit[];
  setUnits: React.Dispatch<React.SetStateAction<StockUnit[]>>;
}

export default function StockUnitsGrid({
  units,
  setUnits,
}: StockUnitsGridProps) {
  const { priceLists, loading, error } = usePriceLists();
  const { formState, updatePriceListItems } = useStockForm();
  const [mounted, setMounted] = useState(false);

  const onExporting = useCallback((e: any) => {
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
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (priceLists.length > 0) {
      const unitsFromPriceLists = priceLists.map((priceList) => {
        const formItem = formState.priceListItems.find(
          (item) => item.priceListId === priceList.id
        );

        if (formItem) {
          return {
            id: formItem.id?.toString() || "",
            value: "",
            label: "",
            priceListId: formItem.priceListId,
            vatRate: formItem.vatRate,
            price: formItem.price,
            priceWithVat: parseFloat(
              (formItem.price * (1 + (formItem.vatRate ?? 0) / 100)).toFixed(2)
            ),
            barcode: formItem.barcode,
          };
        } else {
          return {
            id: "",
            value: "",
            label: "",
            priceListId: priceList.id,
            vatRate: priceList.isVatIncluded ? 20 : null,
            price: 0,
            priceWithVat: priceList.isVatIncluded ? 0 : null,
            barcode: generateBarcode().toString(),
          };
        }
      });

      // Units değişti mi kontrol et
      if (JSON.stringify(units) !== JSON.stringify(unitsFromPriceLists)) {
        setUnits(unitsFromPriceLists);
      }
    }
  }, [priceLists, formState.priceListItems, setUnits, units, mounted]);

  useEffect(() => {
    const unitsToUpdate = units.map((unit) => ({
      id: unit.id,
      priceListId: unit.priceListId,
      vatRate: unit.vatRate,
      price: unit.price,
      priceWithVat: unit.priceWithVat,
      barcode: unit.barcode,
    }));

    // FormState değişti mi kontrol et
    if (
      JSON.stringify(formState.priceListItems) !== JSON.stringify(unitsToUpdate)
    ) {
      updatePriceListItems(unitsToUpdate);
    }
  }, [units, formState.priceListItems, updatePriceListItems]);

  if (!mounted) {
    return null;
  }

  const calculatePriceWithVat = (price: number, vatRate: number) => {
    return price * (1 + vatRate / 100);
  };

  const onEditorPreparing = (e: any) => {
    if (!e?.dataField || !e?.row?.data?.priceListId) {
      return;
    }

    const priceList = priceLists.find((pl) => pl.id === e.row.data.priceListId);

    if (e.dataField === "vatRate") {
      if (e.editorOptions) {
        e.editorOptions.disabled = !priceList?.isVatIncluded;
      }
    }
  };

  const onRowUpdated = (e: any) => {
    const { data } = e;
    if (!data?.priceListId) {
      return;
    }

    const updatedUnits = units.map((unit) => {
      if (unit.priceListId === data.priceListId) {
        const priceList = priceLists.find((pl) => pl.id === unit.priceListId);
        const updatedUnit = { ...unit, ...data };

        if (priceList?.isVatIncluded && updatedUnit.vatRate !== null) {
          updatedUnit.priceWithVat = calculatePriceWithVat(
            updatedUnit.price,
            updatedUnit.vatRate
          );
        } else {
          updatedUnit.priceWithVat = updatedUnit.price;
        }

        return updatedUnit;
      }
      return unit;
    });

    // Units değişti mi kontrol et
    if (JSON.stringify(units) !== JSON.stringify(updatedUnits)) {
      setUnits(updatedUnits);
    }
  };

  const onRowRemoving = (e: any) => {
    e.cancel = true;

    const updatedUnits = units.map((unit) => {
      if (unit.priceListId === e.data.priceListId) {
        return { ...unit, price: 0, vatRate: 0, priceWithVat: 0 };
      }
      return unit;
    });

    // Units değişti mi kontrol et
    if (JSON.stringify(units) !== JSON.stringify(updatedUnits)) {
      setUnits(updatedUnits);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin" />
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
      dataSource={units}
      showBorders={true}
      showRowLines={true}
      showColumnLines={true}
      rowAlternationEnabled={true}
      columnAutoWidth={true}
      wordWrapEnabled={true}
      onExporting={onExporting}
      onRowUpdated={onRowUpdated} // Burada onCellValueChanged yerine onRowUpdated kullanıyoruz
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
            `${item.priceListName} (${item.currency})${
              item.isVatIncluded ? " - KDV Dahil" : ""
            }`
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
        cellRender={(cellData: any) => {
          return cellData.value?.toString() || "0";
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
          if (!priceList?.isVatIncluded || rowData.vatRate === null)
            return rowData.price;
          return calculatePriceWithVat(rowData.price, rowData.vatRate);
        }}
        cellRender={(cellData: any) => {
          const priceList = priceLists.find(
            (pl) => pl.id === cellData.data.priceListId
          );
          if (!priceList?.isVatIncluded) return cellData.data.price.toFixed(2);
          return cellData.value?.toFixed(2) || "0.00";
        }}
      />

      <Column dataField="barcode" caption="Barkod" allowEditing={true} />

      <Toolbar>
        <Item name="exportButton" location="after" />
        <Item name="columnChooserButton" location="after" />
      </Toolbar>
    </DataGrid>
  );
}
