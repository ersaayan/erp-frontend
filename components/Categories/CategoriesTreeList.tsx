'use client';

import React from 'react';
import TreeList, {
    Column,
    ColumnChooser,
    FilterRow,
    HeaderFilter,
    Paging,
    Scrolling,
    SearchPanel,
    Selection,
} from 'devextreme-react/tree-list';
import { categories } from './data';

const CategoriesTreeList: React.FC = () => {
    return (
        <TreeList
            dataSource={categories}
            keyExpr="id"
            parentIdExpr="parentId"
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
            <Selection mode="multiple" />
            <FilterRow visible={true} />
            <HeaderFilter visible={true} />
            <SearchPanel visible={true} width={240} placeholder="Ara..." />
            <ColumnChooser enabled={true} mode="select" />
            <Scrolling mode="virtual" />
            <Paging enabled={false} />

            <Column dataField="name" caption="Kategori Adı" />
            <Column dataField="code" caption="Kategori Kodu" />
            <Column dataField="isMainCategory" caption="Ana Kategori" dataType="boolean" />
            <Column dataField="marketplaces" caption="Pazaryerleri" />
            <Column dataField="createdAt" caption="Oluşturma Tarihi" dataType="datetime" format="dd.MM.yyyy HH:mm" />
            <Column dataField="updatedAt" caption="Güncelleme Tarihi" dataType="datetime" format="dd.MM.yyyy HH:mm" />
        </TreeList>
    );
};

export default CategoriesTreeList;