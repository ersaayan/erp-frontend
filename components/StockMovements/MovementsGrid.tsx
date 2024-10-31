'use client';

import React, { useRef, useState } from 'react';
import DataGrid, {
    Column,
    Export,
    FilterRow,
    HeaderFilter,
    Grouping,
    GroupPanel,
    Paging,
    Scrolling,
    SearchPanel,
    Selection,
    Summary,
    TotalItem,
    Toolbar,
    Item,
    ColumnChooser,
    ColumnFixing,
    StateStoring,
    LoadPanel,
    Lookup,
    ColumnChooserSearch,
    ColumnChooserSelection,
    Position,
    FilterBuilderPopup,
    FilterPanel,
} from 'devextreme-react/data-grid';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver-es';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { movements, documentTypes, warehouses, branches, currencies } from './data';
import { DataType } from 'devextreme/common';

interface MovementsGridProps {
    type: 'previous-purchases' | 'customer-purchases' | 'previous-sales' | 'customer-sales' | 'orders' | 'all-movements';
}

const searchEditorOptions = { placeholder: 'Search column' };

const onExporting = (e: any) => {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Stok Hareketleri');

    exportDataGrid({
        component: e.component,
        worksheet,
        autoFilterEnabled: true,
        customizeCell: ({ gridCell, excelCell }: any) => {
            if (gridCell.rowType === 'data') {
                if (typeof gridCell.value === 'number') {
                    excelCell.numFmt = '#,##0.00';
                } else if (gridCell.value instanceof Date) {
                    excelCell.numFmt = 'dd/mm/yyyy';
                }
            }
        }
    }).then(() => {
        workbook.xlsx.writeBuffer().then((buffer) => {
            saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'StokHareketleri.xlsx');
        });
    });
};

const MovementsGrid: React.FC<MovementsGridProps> = ({ type }) => {
    const dataGridRef = useRef<DataGrid>(null);
    const [filterBuilderPopupPosition, setFilterBuilderPopupPosition] = useState({});
    const clearFilters = () => {
        if (dataGridRef.current) {
            dataGridRef.current.instance.clearFilter();
        }
    };

    const renderToolbarButtons = () => (
        <Item location="after" render={() => (
            <div className="flex gap-2">
                <Button variant="outline" size="sm">
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Yenile
                </Button>
            </div>
        )} />
    );

    return (
        <DataGrid
            ref={dataGridRef}
            dataSource={movements}
            showBorders={true}
            showRowLines={true}
            showColumnLines={true}
            rowAlternationEnabled={true}
            allowColumnReordering={true}
            allowColumnResizing={true}
            columnResizingMode='widget'
            columnAutoWidth={true}
            columnHidingEnabled={true}
            remoteOperations={true}
            wordWrapEnabled={true}
            height="calc(100vh - 250px)"
            onExporting={onExporting}
            columnWidth={150}
        >
            <StateStoring enabled={true} type="localStorage" storageKey={`stockMovementsGrid-${type}`} />
            <LoadPanel enabled={true} />
            <Selection mode="multiple" showCheckBoxesMode="always" />
            <FilterRow visible={true} />
            <HeaderFilter visible={true} />
            <GroupPanel visible={true} />
            <Grouping autoExpandAll={false} />
            <ColumnChooser height={340} enabled={true} mode="select">
                <Position my="right top" at="right bottom" of=".dx-datagrid-column-chooser-button" />
                <ColumnChooserSearch enabled={true} editorOptions={searchEditorOptions} />
                <ColumnChooserSelection allowSelectAll={true} selectByClick={true} recursive={true} />
            </ColumnChooser>
            <ColumnFixing enabled={true} />
            <FilterPanel visible={true} />
            <FilterBuilderPopup position={filterBuilderPopupPosition} />
            <Scrolling mode="virtual" rowRenderingMode="virtual" />
            <Paging enabled={false} />
            <SearchPanel visible={true} width={240} placeholder="Ara..." />
            <Export enabled={true} allowExportSelectedData={true} />

            <Column dataField="date" caption="Tarih" dataType="date" format="dd.MM.yyyy" />
            <Column dataField="documentNo" caption="Belge No" />
            <Column dataField="documentType" caption="Belge Tipi">
                <Lookup dataSource={documentTypes} />
            </Column>
            <Column dataField="warehouse" caption="Depo">
                <Lookup dataSource={warehouses} />
            </Column>
            <Column dataField="customer" caption="Cari" />
            <Column dataField="stockCode" caption="Stok Kodu" />
            <Column dataField="stockName" caption="Stok Adı" />
            <Column dataField="unit" caption="Birim" />
            <Column dataField="quantity" caption="Miktar" dataType="number" format="#,##0.##" />
            <Column dataField="unitPrice" caption="Birim Fiyat" dataType="number" format="#,##0.00" />
            <Column dataField="currency" caption="Döviz">
                <Lookup dataSource={currencies} />
            </Column>
            <Column dataField="totalAmount" caption="Tutar" dataType="number" format="#,##0.00" />
            <Column dataField="vat" caption="KDV" dataType="number" format="#,##0.00" />
            <Column dataField="totalWithVat" caption="Toplam" dataType="number" format="#,##0.00" />
            <Column dataField="description" caption="Açıklama" />
            <Column dataField="branch" caption="Şube">
                <Lookup dataSource={branches} />
            </Column>
            <Column dataField="user" caption="Kullanıcı" />
            <Column dataField="createdAt" caption="Oluşturma Tarihi" dataType="datetime" format="dd.MM.yyyy HH:mm" />
            <Column dataField="status" caption="Durum" />

            <Summary>
                <TotalItem
                    column="quantity"
                    summaryType="sum"
                    valueFormat="#,##0.##"
                />
                <TotalItem
                    column="totalAmount"
                    summaryType="sum"
                    valueFormat="#,##0.00"
                />
                <TotalItem
                    column="vat"
                    summaryType="sum"
                    valueFormat="#,##0.00"
                />
                <TotalItem
                    column="totalWithVat"
                    summaryType="sum"
                    valueFormat="#,##0.00"
                />
            </Summary>

            <Toolbar>
                <Item name='groupPanel' location='before' />
                {renderToolbarButtons()}
                <Item name="searchPanel" location='after' />
                <Item name="exportButton" location='after' />
                <Item name="columnChooserButton" location='after' />
            </Toolbar>
        </DataGrid>
    );
};

export default MovementsGrid;