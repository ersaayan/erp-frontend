// components/Roles/RolesGrid.tsx
"use client";

import React from "react";
import DataGrid, {
    Column,
    FilterRow,
    HeaderFilter,
    Paging,
    Scrolling,
    SearchPanel,
    Selection,
} from "devextreme-react/data-grid";
import { Loader2 } from "lucide-react";
import { Role } from "./types";
import { useRoleDialog } from "./useRoleDialog";

interface RolesGridProps {
    roles: Role[];
    loading: boolean;
}

const RolesGrid: React.FC<RolesGridProps> = ({ roles, loading }) => {
    const { openDialog } = useRoleDialog();

    const handleRowDblClick = (e: any) => {
        openDialog(e.data);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading roles...</span>
            </div>
        );
    }

    return (
        <DataGrid
            dataSource={roles}
            showBorders={true}
            showRowLines={true}
            showColumnLines={true}
            rowAlternationEnabled={true}
            onRowDblClick={handleRowDblClick}
            height="calc(100vh - 350px)"
        >
            <Selection mode="single" />
            <FilterRow visible={true} />
            <HeaderFilter visible={true} />
            <SearchPanel visible={true} width={240} placeholder="Ara..." />
            <Scrolling mode="virtual" />
            <Paging enabled={true} defaultPageSize={20} />

            <Column dataField="roleName" caption="Rol Adı" />
            <Column dataField="description" caption="Açıklama" />
            <Column
                dataField="createdAt"
                caption="Oluşturma Tarihi"
                dataType="datetime"
                format="dd.MM.yyyy HH:mm"
            />
        </DataGrid>
    );
};

export default RolesGrid;
