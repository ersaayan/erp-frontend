import { memo, useCallback, useRef, useState } from "react";
import DataGrid, {
  Column,
  Export,
  FilterRow,
  HeaderFilter,
  Grouping,
  GroupPanel,
  Paging,
  Scrolling,
  Selection,
  Toolbar,
  Item,
  ColumnChooser,
  ColumnFixing,
  StateStoring,
  LoadPanel,
} from "devextreme-react/data-grid";
import { Workbook } from "exceljs";
import { saveAs } from "file-saver-es";
import { exportDataGrid } from "devextreme/excel_exporter";
import { StockTakeMovement } from "./types";
import { Box } from "@mui/material";
import { Button } from "@/components/ui/button";
import { List } from "lucide-react";
import StockTakeDetailModal from "./StockTakeDetailModal";

interface MovementsGridProps {
  data: StockTakeMovement[];
  loading?: boolean;
  onSelectionChanged?: (selectedItems: StockTakeMovement[]) => void;
}

const MovementsGrid = ({
  data,
  loading,
  onSelectionChanged,
}: MovementsGridProps) => {
  const dataGridRef = useRef<DataGrid>(null);
  const [selectedMovement, setSelectedMovement] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const onExporting = useCallback((e: any) => {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Stok Sayım Hareketleri");

    exportDataGrid({
      component: e.component,
      worksheet,
      autoFilterEnabled: true,
      customizeCell: ({ gridCell, excelCell }: any) => {
        if (gridCell.rowType === "data") {
          if (gridCell.value instanceof Date) {
            excelCell.numFmt = "dd/mm/yyyy";
          }
        }
      },
    }).then(() => {
      workbook.xlsx.writeBuffer().then((buffer) => {
        saveAs(
          new Blob([buffer], { type: "application/octet-stream" }),
          "StokSayimHareketleri.xlsx"
        );
      });
    });
  }, []);

  const handleViewDetail = async (id: string) => {
    try {
      const response = await fetch(
        `${process.env.BASE_URL}/warehouses/stocktake/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          credentials: "include",
        }
      );
      const data = await response.json();
      setSelectedMovement(data);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error("Stok sayım detayları yüklenirken hata oluştu:", error);
    }
  };

  return (
    <Box sx={{ flex: 1, minHeight: 0 }}>
      <DataGrid
        ref={dataGridRef}
        dataSource={data}
        showBorders={true}
        showRowLines={true}
        showColumnLines={true}
        rowAlternationEnabled={true}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnResizingMode="widget"
        columnAutoWidth={true}
        columnHidingEnabled={true}
        wordWrapEnabled={true}
        height="calc(100vh - 250px)"
        onExporting={onExporting}
        onSelectionChanged={(e) => {
          onSelectionChanged?.(e.selectedRowsData as StockTakeMovement[]);
        }}
      >
        <StateStoring
          enabled={true}
          type="localStorage"
          storageKey="stockTakeMovementsGrid"
        />
        <LoadPanel enabled={loading} />
        <Selection mode="multiple" showCheckBoxesMode="always" />
        <FilterRow visible={true} />
        <HeaderFilter visible={true} />
        <GroupPanel visible={true} />
        <Grouping autoExpandAll={false} />
        <ColumnChooser enabled={true} mode="select" />
        <ColumnFixing enabled={true} />
        <Scrolling mode="virtual" rowRenderingMode="virtual" />
        <Paging enabled={false} />
        <Export enabled={true} allowExportSelectedData={true} />

        <Column
          type="buttons"
          width={70}
          caption="İşlemler"
          cellRender={(cellData: any) => (
            <Button
              variant="outline"
              size="sm"
              className="bg-[#84CC16] hover:bg-[#65A30D]"
              onClick={() => handleViewDetail(cellData.row.data.id)}
            >
              <List className="h-4 w-4 mr-2" />
              Detay
            </Button>
          )}
        />

        <Column
          dataField="documentNo"
          caption="Belge No"
          allowFiltering={true}
          allowHeaderFiltering={true}
        />
        <Column
          dataField="branchCode"
          caption="Şube"
          allowFiltering={true}
          allowHeaderFiltering={true}
        />
        <Column
          dataField="stockTakeType"
          caption="Sayım Tipi"
          allowFiltering={true}
          allowHeaderFiltering={true}
        />
        <Column
          dataField="status"
          caption="Durum"
          allowFiltering={true}
          allowHeaderFiltering={true}
        />
        <Column
          dataField="description"
          caption="Açıklama"
          allowFiltering={true}
          allowHeaderFiltering={true}
        />
        <Column
          dataField="reference"
          caption="Referans"
          allowFiltering={true}
          allowHeaderFiltering={true}
        />
        <Column
          dataField="startedAt"
          caption="Başlangıç Tarihi"
          dataType="datetime"
          format="dd.MM.yyyy HH:mm"
          allowFiltering={true}
          allowHeaderFiltering={true}
        />
        <Column
          dataField="createdBy"
          caption="Oluşturan"
          allowFiltering={true}
          allowHeaderFiltering={true}
        />
        <Column
          dataField="createdAt"
          caption="Oluşturma Tarihi"
          dataType="datetime"
          format="dd.MM.yyyy HH:mm"
          allowFiltering={true}
          allowHeaderFiltering={true}
        />

        <Toolbar>
          <Item name="groupPanel" location="before" />
          <Item name="exportButton" location="after" />
          <Item name="columnChooserButton" location="after" />
        </Toolbar>
      </DataGrid>

      <StockTakeDetailModal
        open={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        data={selectedMovement}
      />
    </Box>
  );
};

export default memo(MovementsGrid);
