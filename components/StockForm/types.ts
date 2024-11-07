export interface Attribute {
    id: string;
    attributeName: string;
    value: string;
}

export interface SelectedProperty {
    attributeId: string;
    propertyName: string;
    selectedValues: string[];
}

export interface GroupedAttribute {
    name: string;
    values: Array<{
        id: string;
        value: string;
    }>;
}

export interface Manufacturer {
    id: number;
    brandName: string;
    brandCode: string;
    currentId: string;
    stockName: string;
    code: string;
    barcode: string;
    brandId: string;
}

export interface StockUnit {
    id: number;
    value: string;
    label: string;
    priceListId: string;
    vatRate: number | null;
    price: number;
    priceWithVat: number | null;
    barcode: string;
}

export interface FilterBuilderPopupPosition {
    of?: string | Element;
    at?: string;
    my?: string;
    offset?: string;
}