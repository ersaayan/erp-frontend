import { Current } from "@/components/CurrentList/types";

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
    discountRate: number;
    discountAmount: number;
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

export interface InvoiceFormData {
    invoiceNo: string;
    gibInvoiceNo: string;
    invoiceDate: Date;
    paymentDate: Date;
    paymentTerm: number;
    branchCode: string;
    warehouseId: string;
    description: string;
    current: Current | null;
}

export interface ValidationErrors {
    invoiceNo?: string;
    gibInvoiceNo?: string;
    branchCode?: string;
    warehouseId?: string;
    current?: string;
}