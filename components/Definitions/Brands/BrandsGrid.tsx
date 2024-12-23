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
import { Brand } from "./types";
import { useBrandDialog } from "./useBrandDialog";

interface BrandsGridProps {
  brands: Brand[];
  loading: boolean;
}

const BrandsGrid: React.FC<BrandsGridProps> = ({ brands, loading }) => {
  const { openDialog } = useBrandDialog();

  const handleRowDblClick = (e: any) => {
    openDialog(e.data);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading brands...</span>
      </div>
    );
  }

  return (
    <DataGrid
      dataSource={brands}
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

      <Column dataField="brandName" caption="Marka Adı" />
      <Column dataField="brandCode" caption="Marka Kodu" />
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
      <Column dataField="createdBy" caption="Oluşturan" />
      <Column dataField="updatedBy" caption="Güncelleyen" />
    </DataGrid>
  );
};

export default BrandsGrid;