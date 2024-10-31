export interface Stock {
    id: number;
    name: string;
    code: string;
    barcode: string;
    salePrice: number;
    salePriceWithTax: number;
    currency: string;
    currentQuantity: number;
    unit: string;
    imageUrl?: string;
}