'use client';

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Search } from 'lucide-react';
import DataGrid, {
    Column,
    Editing,
    Lookup,
    Scrolling,
} from 'devextreme-react/data-grid';

const priceTypes = [
    { id: 'fixed', name: 'Sabit Fiyat' },
    { id: 'percentage', name: 'Yüzdelik' },
];

const GroupStocks: React.FC = () => {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Gruba Ait Stoklar</h3>
                    
                    <div className="flex items-center space-x-2">
                        <Input
                            placeholder="Gruba eklemek için stok ara..."
                            className="max-w-sm"
                        />
                        <Button variant="outline" size="icon">
                            <Search className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon">
                            <Plus className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon">
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>

                    <DataGrid
                        dataSource={[]}
                        showBorders={true}
                        showRowLines={true}
                        showColumnLines={true}
                        rowAlternationEnabled={true}
                        height={400}
                    >
                        <Editing
                            mode="cell"
                            allowUpdating={true}
                            allowDeleting={true}
                        />
                        <Scrolling mode="virtual" />

                        <Column dataField="stockName" caption="Stok Adı" allowEditing={false} />
                        <Column dataField="quantity" caption="Miktar" dataType="number" />
                        <Column dataField="priceType" caption="Fiyat Tipi">
                            <Lookup dataSource={priceTypes} valueExpr="id" displayExpr="name" />
                        </Column>
                        <Column dataField="groupUnitPrice" caption="Grup Birim Fiyatı" dataType="number" format="#,##0.00" />
                        <Column dataField="purchasePrice" caption="Alış Fiyat" dataType="number" format="#,##0.00" />
                        <Column dataField="salePrice" caption="Satış Fiyat" dataType="number" format="#,##0.00" />
                        <Column dataField="webPrice" caption="Web Fiyat" dataType="number" format="#,##0.00" />
                    </DataGrid>
                </div>
            </CardContent>
        </Card>
    );
};

export default GroupStocks;