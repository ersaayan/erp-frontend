export interface CountedProduct {
    id: string;
    productName: string;
    productCode: string;
    quantity: number;
}

export interface SearchResult {
    id: string;
    productName: string;
    productCode: string;
    unit: string;
}

export interface Warehouse {
    id: string;
    warehouseName: string;
    warehouseCode: string;
}

export interface Branch {
    id: string;
    branchName: string;
    branchCode: string;
}