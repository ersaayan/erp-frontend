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
import { Branch } from "./types";
import { useBranchDialog } from "./useBranchDialog";

const BranchesGrid: React.FC = () => {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { openDialog } = useBranchDialog();

    const fetchBranches = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${process.env.BASE_URL}/branches`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                },
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error("Failed to fetch branches");
            }
            const data = await response.json();
            setBranches(data);
            setError(null);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "An error occurred while fetching branches"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBranches();

        // Listen for refresh events
        const handleRefresh = () => {
            fetchBranches();
        };

        window.addEventListener("refreshBranches", handleRefresh);

        return () => {
            window.removeEventListener("refreshBranches", handleRefresh);
        };
    }, []);

    const handleRowDblClick = (e: any) => {
        openDialog(e.data);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading branches...</span>
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
            dataSource={branches}
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
                storageKey="branchesGrid"
            />
            <LoadPanel enabled={true} />
            <Selection mode="multiple" />
            <FilterRow visible={true} />
            <HeaderFilter visible={true} />
            <SearchPanel visible={true} width={240} placeholder="Ara..." />
            <ColumnChooser enabled={true} mode="select" />
            <Scrolling mode="virtual" />
            <Paging enabled={false} />

            <Column dataField="branchName" caption="Şube Adı" />
            <Column dataField="branchCode" caption="Şube Kodu" />
            <Column dataField="address" caption="Adres" />
            <Column dataField="countryCode" caption="Ülke Kodu" />
            <Column dataField="city" caption="Şehir" />
            <Column dataField="district" caption="İlçe" />
            <Column dataField="phone" caption="Telefon" />
            <Column dataField="email" caption="E-posta" />
            <Column dataField="website" caption="Website" />
            <Column dataField="companyCode" caption="Firma Kodu" />
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

export default BranchesGrid;