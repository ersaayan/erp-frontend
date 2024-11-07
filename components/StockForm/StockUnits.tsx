'use client';

import React, { useEffect } from 'react';
import DataGrid, {
    Column,
    Export,
    Editing,
    Lookup,
    FilterRow,
    HeaderFilter,
    Selection,
    Toolbar,
    Item,
    ColumnChooser,
    Button as DxButton,
} from 'devextreme-react/data-grid';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver-es';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from 'lucide-react';
import { usePriceLists } from './hooks/usePriceLists';
import { useStockForm } from './hooks/useStockForm';
import { StockUnit } from './types'; // Import StockUnit interface

interface StockUnitsProps {
    units: StockUnit[];
    setUnits: React.Dispatch<React.SetStateAction<StockUnit[]>>;
}

const generateBarcode = () => {
    return Math.floor(Math.random() * 9000000000000) + 1000000000000;
};

const onExporting = (e: any) => {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Birimler');

    exportDataGrid({
        component: e.component,
        worksheet,
        autoFilterEnabled: true,
    }).then(() => {
        workbook.xlsx.writeBuffer().then((buffer) => {
            saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Birimler.xlsx');
        });
    });
};

const StockUnits: React.FC<StockUnitsProps> = ({ units, setUnits }) => {
    const { priceLists, loading, error } = usePriceLists();
    const { formState, updatePriceListItems } = useStockForm();  // Get 'updatePriceListItems' from useStockForm

    useEffect(() => {
        // Initialize units from formState if available, otherwise from priceLists
        if (formState.priceListItems.length > 0) {
            setUnits(formState.priceListItems.map((item, index) => ({
                id: index + 1,
                priceListId: item.priceListId,
                vatRate: item.vatRate,
                price: item.price,
                priceWithVat: item.priceWithVat,
                barcode: item.barcode,
                value: '',
                label: ''
            })));
        } else if (priceLists.length > 0) {
            const initialUnits = priceLists.map((priceList, index) => ({
                id: index + 1,
                priceListId: priceList.id,
                vatRate: priceList.isVatIncluded ? 20 : null,
                price: 0,
                priceWithVat: priceList.isVatIncluded ? 0 : null,
                barcode: generateBarcode().toString(),
                value: '',
                label: '',
            }));
            setUnits(initialUnits);
            updatePriceListItems(initialUnits);
        }
    }, [priceLists]); // Removed formState.priceListItems from dependencies

    const calculatePriceWithVat = (price: number, vatRate: number) => {
        return price * (1 + vatRate / 100);
    };

    const onEditorPreparing = (e: any) => {
        if (!e?.dataField || !e?.row?.data?.priceListId) {
            return;
        }

        const priceList = priceLists.find(pl => pl.id === e.row.data.priceListId);

        if (e.dataField === 'vatRate') {
            if (e.editorOptions) {
                e.editorOptions.disabled = !priceList?.isVatIncluded;
            }
        }
    };

    const onCellValueChanged = (e: any) => {
        if (!e?.data?.id || !e?.dataField) {
            return;
        }

        const updatedUnits = units.map(unit => {
            if (unit.id === e.data.id) {
                const priceList = priceLists.find(pl => pl.id === unit.priceListId);
                const updatedUnit = { ...unit, [e.dataField]: e.value };

                if (priceList?.isVatIncluded && updatedUnit.vatRate !== null) {
                    updatedUnit.priceWithVat = calculatePriceWithVat(updatedUnit.price, updatedUnit.vatRate);
                } else {
                    updatedUnit.priceWithVat = updatedUnit.price;
                }

                return updatedUnit;
            }
            return unit;
        });

        setUnits(updatedUnits);
        updatePriceListItems(updatedUnits);
    };

    const updateFormState = React.useCallback(() => {
        updatePriceListItems(units.map(unit => ({
            priceListId: unit.priceListId,
            vatRate: unit.vatRate,
            price: unit.price,
            priceWithVat: unit.priceWithVat,
            barcode: unit.barcode
        })));
    }, [units, updatePriceListItems]);

    // Save state before unmounting
    useEffect(() => {
        return () => {
            if (units.length > 0) {
                updateFormState();
            }
        };
    }, [units]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin" />
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
        <Card>
            <CardContent className="pt-6">
                <DataGrid
                    dataSource={units}
                    showBorders={true}
                    showRowLines={true}
                    showColumnLines={true}
                    rowAlternationEnabled={true}
                    columnAutoWidth={true}
                    wordWrapEnabled={true}
                    onExporting={onExporting}
                    onCellHoverChanged={onCellValueChanged}
                    onEditorPreparing={onEditorPreparing}
                >
                    <Selection mode="multiple" />
                    <FilterRow visible={true} />
                    <HeaderFilter visible={true} />
                    <Export enabled={true} />
                    <ColumnChooser enabled={true} mode="select" />
                    <Editing
                        mode="cell"
                        allowUpdating={true}
                        allowDeleting={true}
                    />

                    <Column type="buttons" width={70} caption="Sil">
                        <DxButton name="delete" />
                    </Column>

                    <Column
                        dataField="priceListId"
                        caption="Fiyat Listesi"
                        allowEditing={false}
                    >
                        <Lookup
                            dataSource={priceLists}
                            valueExpr="id"
                            displayExpr={(item: any) =>
                                `${item.priceListName} (${item.currency})${item.isVatIncluded ? ' - KDV Dahil' : ''}`
                            }
                        />
                    </Column>

                    <Column
                        dataField="price"
                        caption="Fiyat"
                        dataType="number"
                        format="#,##0.00"
                        allowEditing={true}
                    />

                    <Column
                        dataField="vatRate"
                        caption="KDV (%)"
                        dataType="number"
                        format="#,##0"
                        allowEditing={true}
                        visible={true}
                        calculateCellValue={(rowData: StockUnit) => {
                            const priceList = priceLists.find(pl => pl.id === rowData.priceListId);
                            return priceList?.isVatIncluded ? rowData.vatRate : 0;
                        }}
                        cellRender={(cellData: any) => {
                            return cellData.value?.toString() || '0';
                        }}
                    />

                    <Column
                        dataField="priceWithVat"
                        caption="KDV Dahil Fiyat"
                        dataType="number"
                        format="#,##0.00"
                        allowEditing={false}
                        calculateCellValue={(rowData: StockUnit) => {
                            const priceList = priceLists.find(pl => pl.id === rowData.priceListId);
                            if (!priceList?.isVatIncluded || rowData.vatRate === null) return rowData.price;
                            return calculatePriceWithVat(rowData.price, rowData.vatRate);
                        }}
                        cellRender={(cellData: any) => {
                            const priceList = priceLists.find(pl => pl.id === cellData.data.priceListId);
                            if (!priceList?.isVatIncluded) return cellData.data.price.toFixed(2);
                            return cellData.value?.toFixed(2) || '0.00';
                        }}
                    />

                    <Column
                        dataField="barcode"
                        caption="Barkod"
                        allowEditing={true}
                    />

                    <Toolbar>
                        <Item name="exportButton" location="after" />
                        <Item name="columnChooserButton" location="after" />
                    </Toolbar>
                </DataGrid>
            </CardContent>
        </Card>
    );
};

export default StockUnits;