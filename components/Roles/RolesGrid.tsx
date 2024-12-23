"use client";

import React, { useEffect, useState } from "react";
import DataGrid, {
    Column,
    ColumnChooser,
    FilterRow,
    HeaderFilter,
    Paging,
    Scrolling,
    SearchPanel,
    Selection,
    LoadPanel,
    StateStoring,
} from "devextreme-react/data-grid";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { Role } from "./types";
import { useRoleDialog } from "./RoleDialog/useRoleDialog";

const RolesGrid: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { openDialog } = useRoleDialog();

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${process.env.BASE_URL}/roles`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                },
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Failed to fetch roles");
            }

            const data = await response.json();
            setRoles(data);
            setError(null);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "An error occurred while fetching roles"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();

        // Listen for refresh events
        const handleRefresh = () => {
            fetchRoles();
        };

        window.addEventListener("refreshRoles", handleRefresh);

        return () => {
            window.removeEventListener("refreshRoles", handleRefresh);
        };
    }, []);

    const handleRowDblClick = (e: any) => {
        if (e.data) {
            openDialog(e.data);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading roles...</span>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <DataGrid
            dataSource={roles}
            showBorders={true}
            showRowLines={true}
            showColumnLines={true}
            rowAlternationEnabled={true}
            allowColumnReordering={true}
            allowColumnResizing={true}
            columnAutoWidth={true}
            wordWrapEnabled={true}
            height="calc(100vh - 250px)"
            onRowDblClick={handleRowDblClick}
        >
            <StateStoring
                enabled={true}
                type="localStorage"
                storageKey="rolesGrid"
            />
            <LoadPanel enabled={true} />
            <Selection mode="multiple" />
            <FilterRow visible={true} />
            <HeaderFilter visible={true} />
            <SearchPanel visible={true} width={240} placeholder="Ara..." />
            <ColumnChooser enabled={true} mode="select" />
            <Scrolling mode="virtual" />
            <Paging enabled={false} />

            <Column dataField="roleName" caption="Rol Adı" />
            <Column dataField="description" caption="Açıklama" />
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

export default RolesGrid;
