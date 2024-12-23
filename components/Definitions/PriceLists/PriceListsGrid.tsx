"use client";

import React from "react";
import DataGrid, {
  Column,
  Editing,
  FilterRow,
  HeaderFilter,
  Paging,
  Scrolling,
  SearchPanel,
  Selection,
  Sorting,
} from "devextreme-react/data-grid";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { PriceList } from "./types";
import { usePriceListDialog } from "./usePriceListDialog";

interface PriceListsGridProps {
  priceLists: PriceList[];
  loading: boolean;
}

const PriceListsGrid: React.FC<PriceListsGridProps> = ({ priceLists, loading }) => {
  const { openDialog } = usePriceListDialog();

  const handleRowDblClick = (e: any) => {
    openDialog(e.data);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading price lists...</span>
      </div>
    );
  }

  return (
    <DataGrid
      dataSource={priceLists}
      showBorders={true}
      showRowLines={true}
      showColumnLines={true}
      rowAlternationEnabled={true}
      onRowDblClick={handleRowDblClick}
      height="calc(100vh - 350px)"
    >
      <Selection mode="single" />
      <Sorting mode="multiple" />
      <FilterRow visible={true} />
      <HeaderFilter visible={true} />
      <SearchPanel visible={true} width={240} placeholder="Ara..." />
      <Scrolling mode="virtual" />
      <Paging enabled={true} defaultPageSize={20} />
      <Editing mode="popup" allowUpdating={false} allowDeleting={false} />

      <Column dataField="priceListName" caption="Fiyat Listesi Adı" />
      <Column dataField="currency" caption="Para Birimi" />
      <Column dataField="isVatIncluded" caption="KDV Dahil" dataType="boolean" />
      <Column dataField="isActive" caption="Aktif" dataType="boolean" />
      <Column
        dataField="createdAt"
        caption="Oluşturma Tarihi"
        dataType="datetime"
        format="dd.MM.yyyy HH:mm"
      />
      <Column
        dataField="updatedAt"
        caption="Güncelleme Tarihi"
        dataType="datetime"
        format="dd.MM.yyyy HH:mm"
      />
    </DataGrid>
  );
};

export default PriceListsGrid;