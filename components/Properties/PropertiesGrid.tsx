'use client';

import React from 'react';
import DataGrid, {
    Column,
    FilterRow,
    HeaderFilter,
    Grouping,
    GroupPanel,
    Paging,
    Scrolling,
    SearchPanel,
    Selection,
    Toolbar,
    Item,
    ColumnChooser,
    ColumnFixing,
    StateStoring,
    LoadPanel,
} from 'devextreme-react/data-grid';
import { properties } from './data';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { usePropertyDialog } from './usePropertyDialog';

const PropertiesGrid: React.FC = () => {
    const { openDialog } = usePropertyDialog();

    const renderEditButton = (data: any) => {
        return (
            <Button
                variant="ghost"
                size="icon"
                onClick={() => openDialog(data.data)}
            >
                <Edit className="h-4 w-4" />
            </Button>
        );
    };

    return (
        <DataGrid
            dataSource={properties}
            showBorders={true}
            showRowLines={true}
            showColumnLines={true}
            rowAlternationEnabled={true}
            allowColumnReordering={true}
            allowColumnResizing={true}
            columnAutoWidth={true}
            wordWrapEnabled={true}
            height="calc(100vh - 250px)"
        >
            <StateStoring enabled={true} type="localStorage" storageKey="propertiesGrid" />
            <LoadPanel enabled={true} />
            <Selection mode="multiple" showCheckBoxesMode="always" />
            <FilterRow visible={true} />
            <HeaderFilter visible={true} />
            <GroupPanel visible={true} />
            <Grouping autoExpandAll={false} />
            <ColumnChooser enabled={true} mode="select" />
            <ColumnFixing enabled={true} />
            <Scrolling mode="virtual" rowRenderingMode="virtual" />
            <Paging enabled={false} />
            <SearchPanel visible={true} width={240} placeholder="Ara..." />

            <Column type="buttons" width={70} cellRender={renderEditButton} />
            <Column dataField="name" caption="Özellik Adı" />
            <Column dataField="values" caption="Değerler" cellRender={(data) => {
                const values = data.value || [];
                return (
                    <div className="flex flex-wrap gap-1">
                        {values.map((value: string, index: number) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                            >
                                {value}
                            </span>
                        ))}
                    </div>
                );
            }} />
            <Column dataField="createdAt" caption="Oluşturma Tarihi" dataType="datetime" format="dd.MM.yyyy HH:mm" />
            <Column dataField="updatedAt" caption="Güncelleme Tarihi" dataType="datetime" format="dd.MM.yyyy HH:mm" />

            <Toolbar>
                <Item name='groupPanel' location='before' />
                <Item name="searchPanel" location='after' />
                <Item name="columnChooserButton" location='after' />
            </Toolbar>
        </DataGrid>
    );
};

export default PropertiesGrid;