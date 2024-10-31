'use client';

import React, { useRef } from 'react';
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
    Lookup,
} from 'devextreme-react/data-grid';
import { campaigns, campaignTypes, conditionTypes, discountTypes } from './data';

const CampaignsGrid: React.FC = () => {
    const dataGridRef = useRef<DataGrid>(null);

    return (
        <DataGrid
            ref={dataGridRef}
            dataSource={campaigns}
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
            <StateStoring enabled={true} type="localStorage" storageKey="campaignsGrid" />
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

            <Column dataField="status" caption="Durum" width={100}>
                <Lookup
                    dataSource={[
                        { id: 'active', text: 'Aktif' },
                        { id: 'inactive', text: 'Pasif' },
                    ]}
                    valueExpr="id"
                    displayExpr="text"
                />
            </Column>
            <Column dataField="name" caption="Kampanya Adı" />
            <Column dataField="startDate" caption="Başlangıç Tarihi" dataType="datetime" format="dd.MM.yyyy HH:mm" />
            <Column dataField="endDate" caption="Bitiş Tarihi" dataType="datetime" format="dd.MM.yyyy HH:mm" />
            <Column dataField="campaignType" caption="Kapsam Tipi">
                <Lookup dataSource={campaignTypes} />
            </Column>
            <Column dataField="conditionType" caption="Koşul Tipi">
                <Lookup dataSource={conditionTypes} />
            </Column>
            <Column dataField="discountType" caption="İndirim Tipi">
                <Lookup dataSource={discountTypes} />
            </Column>
            <Column dataField="description" caption="Açıklama (Hesaplanan)" />

            <Toolbar>
                <Item name="searchPanel" />
                <Item name="columnChooserButton" />
            </Toolbar>
        </DataGrid>
    );
};

export default CampaignsGrid;