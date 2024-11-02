'use client';

import React, { useRef, useState, useCallback } from 'react';
import DataGrid, {
    Column,
    Export,
    Selection,
    FilterRow,
    HeaderFilter,
    FilterPanel,
    FilterBuilderPopup,
    Scrolling,
    GroupPanel,
    Grouping,
    Summary,
    TotalItem,
    ColumnChooser,
    Toolbar,
    Item,
    Paging,
    StateStoring,
} from 'devextreme-react/data-grid';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver-es';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Filter, RefreshCw, Settings, Upload } from 'lucide-react';
import { StockCard } from './types';
import { currencyService } from '@/lib/services/currency';
import { useToast } from '@/hooks/use-toast';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const StockList: React.FC = () => {
    const { toast } = useToast();
    const [stockData, setStockData] = useState<StockCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [exchangeRates, setExchangeRates] = useState<{ USD_TRY: number; EUR_TRY: number } | null>(null);
    const dataGridRef = useRef<DataGrid>(null);
    const [quickFilterText, setQuickFilterText] = useState('');
    const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Settings state
    const [settings, setSettings] = useState({
        showGroupPanel: true,
        showFilterRow: true,
        showHeaderFilter: true,
        alternateRowColoring: true,
        pageSize: '50',
        virtualScrolling: true
    });

    // Fetch data and exchange rates
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [stockResponse, ratesResponse] = await Promise.all([
                fetch('http://localhost:1303/stockcards/stockCardsWithRelations'),
                currencyService.getExchangeRates()
            ]);

            if (!stockResponse.ok) {
                throw new Error('Failed to fetch stock data');
            }

            const data = await stockResponse.json();
            setStockData(data);
            setExchangeRates(ratesResponse);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to fetch stock data. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Export functionality
    const onExporting = React.useCallback((e: any) => {
        const workbook = new Workbook();
        const worksheet = workbook.addWorksheet('Stock List');

        exportDataGrid({
            component: e.component,
            worksheet,
            autoFilterEnabled: true,
            customizeCell: ({ gridCell, excelCell }: any) => {
                if (gridCell.rowType === 'data') {
                    if (typeof gridCell.value === 'number') {
                        excelCell.numFmt = '#,##0.00';
                    }
                }
            }
        }).then(() => {
            workbook.xlsx.writeBuffer().then((buffer) => {
                saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'StockList.xlsx');
            });
        });
    }, []);

    // Quick filter functionality
    const applyQuickFilter = useCallback(() => {
        if (!dataGridRef.current) return;

        const instance = dataGridRef.current.instance;
        if (quickFilterText) {
            instance.filter([
                ['productCode', 'contains', quickFilterText],
                'or',
                ['productName', 'contains', quickFilterText],
                'or',
                ['Barcodes.barcode', 'contains', quickFilterText]
            ]);
        } else {
            instance.clearFilter();
        }
    }, [quickFilterText]);

    // Handle file import
    const handleImport = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Simulate file processing
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing
            toast({
                title: "Success",
                description: `File "${file.name}" imported successfully.`,
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to import file. Please try again. Message: " + (error instanceof Error ? error.message : 'Unknown error'),
            });
        } finally {
            setLoading(false);
            if (event.target) {
                event.target.value = '';
            }
        }
    }, [toast]);

    // Calculate total quantity for a stock item
    const calculateTotalQuantity = useCallback((rowData: StockCard) => {
        return rowData.StockCardWarehouse.reduce((total, warehouse) => {
            return total + parseInt(warehouse.quantity, 10);
        }, 0);
    }, []);

    // Render price with TRY equivalent
    const renderPriceWithTRY = useCallback((price: number, currency: string) => {
        if (!exchangeRates || currency === 'TRY') return price.toFixed(2);

        const rate = currency === 'USD' ? exchangeRates.USD_TRY : exchangeRates.EUR_TRY;
        const tryPrice = price * rate;
        return `${price.toFixed(2)} (₺${tryPrice.toFixed(2)})`;
    }, [exchangeRates]);

    // Get category path
    const getCategoryPath = useCallback((rowData: StockCard) => {
        if (!rowData.Categories?.length) return '';

        const category = rowData.Categories[0];
        if (!category.parentCategories) return category.category.categoryName;

        return category.parentCategories
            .slice()
            .reverse()
            .map(cat => cat.categoryName)
            .join(' > ');
    }, []);

    // Toolbar content
    const renderToolbarContent = useCallback(() => (
        <div className="flex items-center gap-2">
            <div className="flex-1">
                <Input
                    placeholder="Quick search..."
                    value={quickFilterText}
                    onChange={(e) => setQuickFilterText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && applyQuickFilter()}
                    className="max-w-xs"
                />
            </div>
            <Button
                variant="outline"
                size="sm"
                onClick={() => {
                    setQuickFilterText('');
                    dataGridRef.current?.instance.clearFilter();
                }}
            >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
            </Button>
            <Button variant="outline" size="sm" onClick={fetchData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
            >
                <Upload className="h-4 w-4 mr-2" />
                Import
            </Button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImport}
                accept=".xlsx,.xls"
                className="hidden"
            />
            <Button
                variant="outline"
                size="sm"
                onClick={() => setSettingsOpen(true)}
            >
                <Settings className="h-4 w-4 mr-2" />
                Settings
            </Button>
        </div>
    ), [quickFilterText, applyQuickFilter, fetchData, handleImport]);

    if (error) {
        return (
            <Alert variant="destructive" className="m-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="p-4 space-y-4">
            {renderToolbarContent()}

            <DataGrid
                ref={dataGridRef}
                dataSource={stockData}
                showBorders={true}
                showRowLines={true}
                showColumnLines={true}
                rowAlternationEnabled={settings.alternateRowColoring}
                allowColumnReordering={true}
                allowColumnResizing={true}
                columnAutoWidth={true}
                wordWrapEnabled={true}
                onExporting={onExporting}
                height="calc(100vh - 200px)"
                selectedRowKeys={selectedRowKeys}
                onSelectionChanged={(e) => setSelectedRowKeys(e.selectedRowKeys as string[])}
                loadPanel={{
                    enabled: loading,
                    showIndicator: true,
                    showPane: true,
                    text: 'Loading...'
                }}
            >
                <StateStoring enabled={true} type="localStorage" storageKey="stockListGrid" />
                <Selection mode="multiple" showCheckBoxesMode="always" />
                <FilterRow visible={settings.showFilterRow} />
                <HeaderFilter visible={settings.showHeaderFilter} />
                <FilterPanel visible={true} />
                <FilterBuilderPopup position={{ my: 'top', at: 'top', of: window }} />
                <GroupPanel visible={settings.showGroupPanel} />
                <Grouping autoExpandAll={false} />
                <Scrolling
                    mode={settings.virtualScrolling ? "virtual" : "standard"}
                    rowRenderingMode={settings.virtualScrolling ? "virtual" : "standard"}
                    columnRenderingMode={settings.virtualScrolling ? "virtual" : "standard"}
                />
                <Paging enabled={true} pageSize={parseInt(settings.pageSize)} />
                <Export enabled={true} allowExportSelectedData={true} />
                <ColumnChooser enabled={true} mode="select" />

                {/* Columns configuration remains the same */}
                <Column
                    dataField="productCode"
                    caption="Stock Code"
                    width={120}
                    fixed={true}
                />
                <Column
                    dataField="productName"
                    caption="Stock Name"
                    width={200}
                />
                <Column
                    dataField="Brand.brandName"
                    caption="Brand"
                    width={120}
                />
                <Column
                    dataField="unit"
                    caption="Unit"
                    width={80}
                />
                <Column
                    caption="Category"
                    calculateCellValue={getCategoryPath}
                    dataField='Categories'
                    width={200}
                />
                <Column
                    caption="Total Stock"
                    calculateCellValue={calculateTotalQuantity}
                    dataType="number"
                    format="#,##0"
                    width={100}
                />

                <Column caption="Warehouses">
                    {stockData[0]?.StockCardWarehouse.map(warehouse => (
                        <Column
                            key={warehouse.warehouse.id}
                            caption={warehouse.warehouse.warehouseName}
                            calculateCellValue={(rowData: StockCard) => {
                                const warehouseData = rowData.StockCardWarehouse.find(
                                    w => w.warehouse.id === warehouse.warehouse.id
                                );
                                return warehouseData ? parseInt(warehouseData.quantity, 10) : 0;
                            }}
                            dataType="number"
                            format="#,##0"
                            width={100}
                        />
                    ))}
                </Column>

                <Column caption="Prices">
                    {stockData[0]?.StockCardPriceLists.map(priceList => (
                        <Column
                            key={priceList.priceList.id}
                            caption={`${priceList.priceList.priceListName} (${priceList.priceList.currency})`}
                            calculateCellValue={(rowData: StockCard) => {
                                const priceData = rowData.StockCardPriceLists.find(
                                    p => p.priceList.id === priceList.priceList.id
                                );
                                if (!priceData) return 0;

                                const price = parseFloat(priceData.price);
                                return priceList.priceList.currency === 'USD'
                                    ? renderPriceWithTRY(price, 'USD')
                                    : price.toFixed(2);
                            }}
                            width={150}
                        />
                    ))}
                </Column>

                <Column
                    dataField="productType"
                    caption="Product Type"
                    width={120}
                />
                <Column
                    dataField="stockStatus"
                    caption="Status"
                    dataType="boolean"
                    width={80}
                />
                <Column
                    dataField="createdAt"
                    caption="Created Date"
                    dataType="datetime"
                    format="dd.MM.yyyy HH:mm"
                    width={140}
                />

                <Summary>
                    <TotalItem
                        column="Total Stock"
                        summaryType="sum"
                        valueFormat="#,##0"
                    />
                </Summary>

                <Toolbar>
                    <Item name="groupPanel" />
                    <Item name="exportButton" />
                    <Item name="columnChooserButton" />
                </Toolbar>
            </DataGrid>

            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Table Settings</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="showGroupPanel">Show Group Panel</Label>
                            <Switch
                                id="showGroupPanel"
                                checked={settings.showGroupPanel}
                                onCheckedChange={(checked) =>
                                    setSettings(prev => ({ ...prev, showGroupPanel: checked }))
                                }
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="showFilterRow">Show Filter Row</Label>
                            <Switch
                                id="showFilterRow"
                                checked={settings.showFilterRow}
                                onCheckedChange={(checked) =>
                                    setSettings(prev => ({ ...prev, showFilterRow: checked }))
                                }
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="showHeaderFilter">Show Header Filter</Label>
                            <Switch
                                id="showHeaderFilter"
                                checked={settings.showHeaderFilter}
                                onCheckedChange={(checked) =>
                                    setSettings(prev => ({ ...prev, showHeaderFilter: checked }))
                                }
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="alternateRowColoring">Alternate Row Coloring</Label>
                            <Switch
                                id="alternateRowColoring"
                                checked={settings.alternateRowColoring}
                                onCheckedChange={(checked) =>
                                    setSettings(prev => ({ ...prev, alternateRowColoring: checked }))
                                }
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="virtualScrolling">Virtual Scrolling</Label>
                            <Switch
                                id="virtualScrolling"
                                checked={settings.virtualScrolling}
                                onCheckedChange={(checked) =>
                                    setSettings(prev => ({ ...prev, virtualScrolling: checked }))
                                }
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="pageSize">Page Size</Label>
                            <Select
                                value={settings.pageSize}
                                onValueChange={(value) =>
                                    setSettings(prev => ({ ...prev, pageSize: value }))
                                }
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select page size" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10 rows</SelectItem>
                                    <SelectItem value="25">25 rows</SelectItem>
                                    <SelectItem value="50">50 rows</SelectItem>
                                    <SelectItem value="100">100 rows</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default StockList;