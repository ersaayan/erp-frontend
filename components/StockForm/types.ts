export interface Attribute {
    id: string;
    attributeName: string;
    value: string;
}

export interface SelectedProperty {
    propertyName: string;
    selectedValues: string[];
    attributeIds: string[];
}

export interface GroupedAttribute {
    name: string;
    values: Array<{
        id: string;
        value: string;
    }>;
}

export interface Manufacturer {
    id: string;
    brandName: string;
    brandCode: string;
    currentId: string;
    stockName: string;
    code: string;
    barcode: string;
    brandId: string;
}

export interface StockUnit {
    id?: string;
    value?: string;
    label?: string;
    priceListId: string;
    price: number;
}

export interface FilterBuilderPopupPosition {
    of?: string | Element;
    at?: string;
    my?: string;
    offset?: string;
}