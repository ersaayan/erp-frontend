export interface Stock {
    id: string;
    name: string;
    code: string;
    barcode: string;
    salePrice: number;
    salePriceWithTax: number;
    currency: string;
    currentQuantity: number;
    unit: string;
    shortDescription?: string;
    description?: string;
    brand: string;
    vatRate: number;
    warehouseName: string;
    prices: {
        id: string;
        priceListName: string;
        price: number;
        currency: string;
        vatRate?: number;
    }[];
}
