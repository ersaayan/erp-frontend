
export interface OrderFormData {
    orderNo: string;
    orderDate: Date;
    deliveryDate: Date;
    branchCode: string;
    warehouseId: string;
    description: string;
    current: {
        id: string;
        currentCode: string;
        currentName: string;
        priceList?: {
            id: string;
            priceListName: string;
            currency: string;
            isVatIncluded: boolean;
        };
    } | null;
}

export interface StockItem {
    id: string;
    stockId: string;
    stockCode: string;
    stockName: string;
    quantity: number;
    unit: string;
    stockLevel: number;
    unitPrice: number;
    vatRate: number;
    vatAmount: number;
    totalAmount: number;
    priceListId: string;
    currency: string;
    isVatIncluded: boolean;
}

export interface Branch {
    id: string;
    branchName: string;
    branchCode: string;
}

export interface Warehouse {
    id: string;
    warehouseName: string;
    warehouseCode: string;
}

export interface FormSectionProps {
    title: string;
    description?: string;
    isValid?: boolean;
    error?: string;
    children: React.ReactNode;
    className?: string;
}