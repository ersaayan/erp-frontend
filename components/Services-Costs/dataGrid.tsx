'use client';

import React, { useRef } from 'react';
import DataGrid, {
    Export,
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
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver-es';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { servicesAndCosts } from './data';
import type { DataGridRef } from 'devextreme-react/data-grid';
import type { ExportingEvent } from 'devextreme/ui/data_grid';

const onExporting = (e: ExportingEvent) => {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Hizmet-Masraf');

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
            saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Hizmet-Masraf.xlsx');
        });
    });
};

const ServicesCostsGrid: React.FC = () => {
    const dataGridRef = useRef<DataGridRef>(null);

    const renderToolbarButtons = () => (
        <Item location="before" render={() => (
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
            dataSource={servicesAndCosts}
            showBorders={true}
            showRowLines={true}
            showColumnLines={true}
            rowAlternationEnabled={true}
            allowColumnReordering={true}
            allowColumnResizing={true}
            columnAutoWidth={true}
            wordWrapEnabled={true}
            height="calc(100vh - 250px)"
            onExporting={onExporting}
        >
            <StateStoring enabled={true} type="localStorage" storageKey={`servicesAndCostsGrid`} />
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
            <Export enabled={true} allowExportSelectedData={true} />

            <Toolbar>
                {renderToolbarButtons()}
                <Item name="searchPanel" />
                <Item name="exportButton" />
                <Item name="columnChooserButton" />
            </Toolbar>
        </DataGrid>
    );
};

export default ServicesCostsGrid;