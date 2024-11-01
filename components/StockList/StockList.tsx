'use client';

import React, { useRef, useState, useEffect } from 'react';
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
    Lookup,
    Summary,
    TotalItem,
    ValueFormat,
    ColumnChooser,
    ColumnChooserSearch,
    ColumnChooserSelection,
    Position,
    DataGridTypes,
    SearchPanel,
    Toolbar,
    Item,
} from 'devextreme-react/data-grid';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver-es';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { Import, Settings, X } from 'lucide-react';
import { DataType, HorizontalAlignment, VerticalAlignment } from 'devextreme/common';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { StockCard } from './types';
import { currencyService, ExchangeRate } from '@/lib/services/currency';

const onExporting = (e: DataGridTypes.ExportingEvent) => {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Stok Listesi');

    exportDataGrid({
        component: e.component,
        worksheet,
        autoFilterEnabled: true,
    }).then(() => {
        workbook.xlsx.writeBuffer().then((buffer) => {
            saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'StokListesi.xlsx');
        });
    });
};

const searchEditorOptions = { placeholder: 'Kolon ara' };

const StockList: React.FC = () => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [stockData, setStockData] = useState<StockCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [exchangeRates, setExchangeRates] = useState<ExchangeRate | null>(null);
    const dataGridRef = useRef<DataGrid>(null);
    const [filterBuilderPopupPosition, setFilterBuilderPopupPosition] = useState({});

    useEffect(() => {
        setFilterBuilderPopupPosition({
            of: window,
            at: { x: 'center' as HorizontalAlignment, y: 'top' as VerticalAlignment },
            my: { x: 'center' as HorizontalAlignment, y: 'top' as VerticalAlignment },
            offset: { y: 10 },
        });

        const initData = async () => {
            await Promise.all([
                fetchStockData(),
                fetchExchangeRates()
            ]);
        };

        initData();
    }, []);

    const fetchExchangeRates = async () => {
        const rates = await currencyService.getExchangeRates();
        setExchangeRates(rates);
    };

    const fetchStockData = async () => {
        try {
            const response = await fetch('http://localhost:1303/stockcards/stockCardsWithRelations');
            const data = await response.json();
            setStockData(data);
        } catch (error) {
            console.error('Error fetching stock data:', error);
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        if (dataGridRef.current) {
            dataGridRef.current.instance.clearFilter();
        }
    };

    const renderSettingsButton = () => {
        return (
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                    <button
                        className="dx-button dx-button-normal dx-button-mode-contained dx-widget dx-button-has-icon"
                        title="Ayarlar"
                        style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                        <Settings size={18} className='ml-2' />
                        <span className='mr-2'>Ayarlar</span>
                    </button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Stok Listesi Görünüm Formatları</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <h3 className="text-lg font-medium">Görünüm Ayarları</h3>
                        <p className="text-sm text-gray-500">
                            Stok listesi görünümünü özelleştirin.
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        );
    };

    const renderClearFiltersButton = () => {
        return (
            <button
                className="dx-button dx-button-normal dx-button-mode-contained dx-widget"
                onClick={clearFilters}
                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
            >
                <X size={18} className='ml-2' />
                <span className='mr-2'>Filtreleri Temizle</span>
            </button>
        );
    };

    const renderImportButton = () => {
        return (
            <button
                className="dx-button dx-button-normal dx-button-mode-contained dx-widget"
                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
            >
                <Import size={18} className='ml-2' />
                <span className='mr-2'>Stok İçe Aktar</span>
            </button>
        );
    };

    const calculateTotalQuantity = (rowData: StockCard) => {
        return rowData.StockCardWarehouse.reduce((total, warehouse) => {
            return total + parseInt(warehouse.quantity, 10);
        }, 0);
    };

    const renderPriceWithTRY = (price: number, currency: string) => {
        if (!exchangeRates || currency !== 'USD') return price.toFixed(2);

        const tryPrice = price * exchangeRates.USD_TRY;
        return `${price.toFixed(2)} (₺${tryPrice.toFixed(2)})`;
    };

    const getCategoryPath = (rowData: StockCard) => {
        if (!rowData.Categories || rowData.Categories.length === 0) return '';

        const category = rowData.Categories[0];
        if (!category.parentCategories) return category.category.categoryName;

        const categoryPath = category.parentCategories
            .slice()
            .reverse()
            .map(cat => cat.categoryName)
            .join(' > ');

        return categoryPath;
    };

    return (
        <div className="p-4">
            <DataGrid
                ref={dataGridRef}
                dataSource={stockData}
                showBorders={true}
                showRowLines={true}
                showColumnLines={true}
                width="100%"
                height={600}
                allowColumnResizing={true}
                columnResizingMode='widget'
                allowColumnReordering={true}
                wordWrapEnabled={true}
                columnWidth={150}
                onExporting={onExporting}
                loadPanel={{ enabled: loading }}
            >
                <SearchPanel visible={true} width={240} placeholder="Genel arama..." />
                <GroupPanel visible={true} />
                <FilterRow visible={true} />
                <HeaderFilter visible={true} />
                <Selection mode="multiple" />
                <ColumnChooser height={340} enabled={true} mode="select">
                    <Position my="right top" at="right bottom" of=".dx-datagrid-column-chooser-button" />
                    <ColumnChooserSearch enabled={true} editorOptions={searchEditorOptions} />
                    <ColumnChooserSelection allowSelectAll={true} selectByClick={true} recursive={true} />
                </ColumnChooser>
                <FilterPanel visible={true} />
                <FilterBuilderPopup position={filterBuilderPopupPosition} />
                <Grouping autoExpandAll={false} />
                <Scrolling mode="virtual" columnRenderingMode='virtual' rowRenderingMode='virtual' />
                <Export enabled={true} allowExportSelectedData={true} />

                <Column dataField="productCode" caption="Stok Kodu" fixed={true} />
                <Column dataField="productName" caption="Stok Adı" />
                <Column dataField="Brand.brandName" caption="Marka" />
                <Column dataField="unit" caption="Birim" />
                <Column
                    caption="Kategori"
                    calculateCellValue={getCategoryPath}
                />
                <Column
                    caption="Toplam Stok"
                    calculateCellValue={calculateTotalQuantity}
                    dataType="number"
                    format="#,##0"
                />
                <Column caption="Depolar">
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
                        />
                    ))}
                </Column>
                <Column caption="Fiyatlar">
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
                            cellRender={(cellData: any) => {
                                return <span>{cellData.value}</span>;
                            }}
                        />
                    ))}
                </Column>
                <Column dataField="productType" caption="Ürün Tipi" />
                <Column dataField="stockStatus" caption="Durum" dataType="boolean" />
                <Column dataField="createdAt" caption="Oluşturma Tarihi" dataType="datetime" format="dd.MM.yyyy HH:mm" />

                <Summary>
                    <TotalItem
                        column="Toplam Stok"
                        summaryType="sum"
                        valueFormat="#,##0"
                    />
                </Summary>

                <Toolbar>
                    <Item name='groupPanel' location='before' />
                    <Item name="searchPanel" location="after" />
                    <Item location="after" render={renderClearFiltersButton} />
                    <Item location="after" render={renderSettingsButton} />
                    <Item location="after" render={renderImportButton} />
                    <Item name="exportButton" location="after" />
                    <Item name="columnChooserButton" location="after" />
                </Toolbar>
            </DataGrid>
        </div>
    );
};

export default StockList;