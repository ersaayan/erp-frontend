"use client";

import React from "react";
import DataGrid, {
  Column,
  Editing,
  FilterRow,
  HeaderFilter,
  Selection,
} from "devextreme-react/data-grid";
import { StockUnit } from "../types";
import { usePriceLists } from "../hooks/usePriceLists";

interface StockUnitsGridProps {
  units: StockUnit[];
  setUnits: React.Dispatch<React.SetStateAction<StockUnit[]>>;
}

export default function StockUnitsGrid({
  units,
  setUnits,
}: StockUnitsGridProps) {
  const { priceLists } = usePriceLists();

  return (
    <DataGrid
      dataSource={units}
      keyExpr="id"
      showBorders
      onRowUpdated={(e) => {
        const updatedUnits = units.map((unit) =>
          unit.id === e.key ? { ...unit, ...e.data } : unit
        );
        setUnits(updatedUnits);
      }}
    >
      <Selection mode="single" />
      <FilterRow visible={true} />
      <HeaderFilter visible={true} />
      <Editing
        mode="row"
        allowUpdating={true}
        allowDeleting={true}
        allowAdding={true}
      />

      <Column
        dataField="priceListId"
        caption="Fiyat Listesi"
        lookup={{
          dataSource: priceLists,
          valueExpr: "id",
          displayExpr: "name",
        }}
      />
      <Column dataField="price" caption="Fiyat" dataType="number" />
      <Column dataField="vatRate" caption="KDV Oranı" dataType="number" />
      <Column
        dataField="priceWithVat"
        caption="KDV'li Fiyat"
        dataType="number"
      />
      <Column dataField="barcode" caption="Barkod" />
    </DataGrid>
  );
}
