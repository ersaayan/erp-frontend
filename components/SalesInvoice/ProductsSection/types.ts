export interface ProductSearchResult {
    id: string;
    productCode: string;
    productName: string;
    unit: string;
    stockCardPriceLists: Array<{
        price: string;
        vatRate: string;
        priceListId: string;
        priceList: {
            currency: string;
            isVatIncluded: boolean;
        };
    }>;
    stockCardWarehouse: Array<{
        quantity: string;
        warehouseId: string;
    }>;
}

export interface SelectedProduct {
    id: string;
    productCode: string;
    productName: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    vatRate: number;
    totalAmount: number;
}