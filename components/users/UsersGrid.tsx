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
  Sorting,
} from "devextreme-react/data-grid";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { User } from "./types";
import { useUserDialog } from "./useUserDialog";
import { userService } from "@/lib/services/user";
import { Button } from "../ui/button";
import { getCurrentUserId } from "@/lib/utils/jwt";

const UsersGrid: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { openDialog } = useUserDialog();
  const currentUserId = getCurrentUserId();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();

      // Filter out current user and sort by username
      const filteredAndSortedUsers = data
        .filter((user: User) => user.id !== currentUserId)
        .sort((a: User, b: User) => a.username.localeCompare(b.username));

      setUsers(filteredAndSortedUsers);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while fetching users"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    const handleRefresh = () => {
      fetchUsers();
    };

    window.addEventListener("refreshUsers", handleRefresh);
    return () => {
      window.removeEventListener("refreshUsers", handleRefresh);
    };
  }, []);

  const handleRowDblClick = (e: any) => {
    openDialog(e.data);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-4 animate-spin mr-2" />
        <span>Loading users...</span>
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
      dataSource={users}
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
      <StateStoring enabled={true} type="localStorage" storageKey="usersGrid" />
      <LoadPanel enabled={true} />
      <Selection mode="multiple" />
      <FilterRow visible={true} />
      <HeaderFilter visible={true} />
      <SearchPanel visible={true} width={240} placeholder="Ara..." />
      <ColumnChooser enabled={true} mode="select" />
      <Scrolling mode="virtual" />
      <Paging enabled={true} pageSize={20} />
      <Sorting mode="multiple" />

      <Column
        dataField="username"
        caption="Kullanıcı Adı"
        sortIndex={0}
        sortOrder="asc"
      />
      <Column dataField="email" caption="E-posta" />
      <Column dataField="firstName" caption="Ad" />
      <Column dataField="lastName" caption="Soyad" />
      <Column dataField="phone" caption="Telefon" />
      <Column dataField="companyCode" caption="Firma Kodu" />
      <Column dataField="role[0].description" caption="Rol" />
      <Column dataField="isActive" caption="Durum" />
      <Column
        dataField="createdAt"
        caption="Oluşturma Tarihi"
        dataType="datetime"
        format="dd.MM.yyyy HH:mm"
      />
      <Column
        width={70}
        caption="İşlemler"
        cellRender={(cellData: any) => (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={(e) => {
              e.stopPropagation();
              openDialog(cellData.data);
            }}
          >
            <span className="sr-only">Edit</span>
            <i className="dx-icon dx-icon-edit" />
          </Button>
        )}
      />
    </DataGrid>
  );
};

export default UsersGrid;
