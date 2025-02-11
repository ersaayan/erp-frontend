"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import DataGrid, {
  Column,
  Selection,
  FilterRow,
  HeaderFilter,
  Scrolling,
  LoadPanel,
  StateStoring,
  Export,
  Toolbar,
  Item,
  SearchPanel,
  ColumnChooser,
} from "devextreme-react/data-grid";

export interface GroupedAttribute {
  id: string;
  attributeCode: string;
  attributeName: string;
  attributeType: string;
  attributeValue: string;
  groupCode: string;
  groupName: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

interface PropertiesGridProps {
  attributes: GroupedAttribute[];
  loading: boolean;
  error: string;
  onRefresh: () => Promise<void>;
}

const PropertiesGrid: React.FC<PropertiesGridProps> = ({
  attributes,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Yükleniyor...</span>
      </div>
    );
  }

  return (
    <Card className="flex-1">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <DataGrid
        dataSource={attributes}
        showBorders={true}
        showRowLines={true}
        showColumnLines={true}
        rowAlternationEnabled={true}
        columnAutoWidth={true}
        wordWrapEnabled={true}
        height="calc(100vh - 12rem)"
      >
        <StateStoring
          enabled={true}
          type="localStorage"
          storageKey="propertiesGrid"
        />
        <LoadPanel enabled={loading} />
        <Selection mode="multiple" showCheckBoxesMode="always" />
        <FilterRow visible={true} />
        <HeaderFilter visible={true} />
        <SearchPanel visible={true} width={240} placeholder="Ara..." />
        <ColumnChooser enabled={true} mode="select" />
        <Scrolling mode="virtual" />
        <Export
          enabled={true}
          allowExportSelectedData={true}
          texts={{
            exportAll: "Tüm Verileri Excel'e Aktar",
            exportSelectedRows: "Seçili Satırları Excel'e Aktar",
            exportTo: "Excel'e Aktar",
          }}
        />

        <Column
          dataField="attributeCode"
          caption="Özellik Kodu"
          allowHeaderFiltering={true}
        />
        <Column
          dataField="attributeName"
          caption="Özellik Adı"
          allowHeaderFiltering={true}
        />
        <Column
          dataField="attributeType"
          caption="Özellik Tipi"
          allowHeaderFiltering={true}
        />
        <Column
          dataField="attributeValue"
          caption="Özellik Değeri"
          allowHeaderFiltering={true}
        />
        <Column
          dataField="groupCode"
          caption="Grup Kodu"
          allowHeaderFiltering={true}
        />
        <Column
          dataField="groupName"
          caption="Grup Adı"
          allowHeaderFiltering={true}
        />
        <Column
          dataField="createdAt"
          caption="Oluşturma Tarihi"
          dataType="datetime"
          format="dd.MM.yyyy HH:mm"
          allowHeaderFiltering={false}
        />
        <Column
          dataField="updatedAt"
          caption="Güncelleme Tarihi"
          dataType="datetime"
          format="dd.MM.yyyy HH:mm"
          allowHeaderFiltering={false}
        />
        <Column
          dataField="createdBy"
          caption="Oluşturan"
          allowHeaderFiltering={false}
        />
        <Column
          dataField="updatedBy"
          caption="Güncelleyen"
          allowHeaderFiltering={false}
        />

        <Toolbar>
          <Item name="searchPanel" />
          <Item name="exportButton" />
          <Item name="columnChooserButton" />
        </Toolbar>
      </DataGrid>
    </Card>
  );
};

export default PropertiesGrid;
