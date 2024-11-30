import React from 'react';
import DataGrid, {
    Column,
    Editing,
    Lookup,
    Summary,
    TotalItem,
} from 'devextreme-react/data-grid';

const PurchaseInvoiceItems: React.FC = () => {
    return (
        <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Kalemler</h3>
            <DataGrid
                dataSource={[]}
                showBorders={true}
                height={400}
            >
                <Editing
                    mode="cell"
                    allowUpdating={true}
                    allowAdding={true}
                    allowDeleting={true}
                />

                <Column dataField="productCode" caption="Stok Kodu" />
                <Column dataField="productName" caption="Stok Adı" />
                <Column dataField="quantity" caption="Miktar" dataType="number" />
                <Column dataField="unit" caption="Birim" />
                <Column dataField="unitPrice" caption="Birim Fiyat" dataType="number" format="#,##0.00" />
                <Column dataField="vatRate" caption="KDV %" dataType="number" />
                <Column dataField="vatAmount" caption="KDV Tutarı" dataType="number" format="#,##0.00" />
                <Column dataField="totalAmount" caption="Toplam" dataType="number" format="#,##0.00" />

                <Summary>
                    <TotalItem
                        column="vatAmount"
                        summaryType="sum"
                        valueFormat="#,##0.00"
                    />
                    <TotalItem
                        column="totalAmount"
                        summaryType="sum"
                        valueFormat="#,##0.00"
                    />
                </Summary>
            </DataGrid>
        </div>
    );
};

export default PurchaseInvoiceItems;