"use client";

import React, { useEffect, useState } from "react";
import TreeList, {
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
} from "devextreme-react/tree-list";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { CurrentCategory } from "./types";
import CurrentCategoryEditDialog from "./CurrentCategoryEditDialog";

const CurrentCategoriesTreeList: React.FC = () => {
  const [categories, setCategories] = useState<CurrentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<CurrentCategory | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.BASE_URL}/currentCategories/withParents`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch current categories");
      }
      const data = await response.json();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while fetching current categories"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();

    // Listen for refresh events
    const handleRefresh = () => {
      fetchCategories();
    };

    window.addEventListener("refreshCurrentCategories", handleRefresh);

    return () => {
      window.removeEventListener("refreshCurrentCategories", handleRefresh);
    };
  }, []);

  const handleRowDblClick = (e: any) => {
    setSelectedCategory(e.data);
    setEditDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading current categories...</span>
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
    <>
      <TreeList
        dataSource={categories}
        keyExpr="id"
        parentIdExpr="parentCategoryId"
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
          storageKey="currentCategoriesTreeList"
        />
        <LoadPanel enabled={true} />
        <Selection mode="multiple" />
        <FilterRow visible={true} />
        <HeaderFilter visible={true} />
        <SearchPanel visible={true} width={240} placeholder="Ara..." />
        <ColumnChooser enabled={true} mode="select" />
        <Scrolling mode="virtual" />
        <Paging enabled={false} />

        <Column dataField="categoryName" caption="Kategori Adı" />
        <Column dataField="categoryCode" caption="Kategori Kodu" />
        <Column
          dataField="parentCategoryId"
          caption="Ana Kategori"
          calculateCellValue={(rowData: CurrentCategory) =>
            rowData.parentCategoryId === null ? "Evet" : "Hayır"
          }
          dataType="boolean"
        />
        <Column
          dataField="createdAt"
          caption="Oluşturma Tarihi"
          dataType="datetime"
          format="dd.MM.yyyy HH:mm"
          visible={false}
        />
        <Column
          dataField="updatedAt"
          caption="Güncelleme Tarihi"
          dataType="datetime"
          format="dd.MM.yyyy HH:mm"
          visible={false}
        />
      </TreeList>

      <CurrentCategoryEditDialog
        category={selectedCategory}
        isOpen={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedCategory(null);
        }}
      />
    </>
  );
};

export default CurrentCategoriesTreeList;
